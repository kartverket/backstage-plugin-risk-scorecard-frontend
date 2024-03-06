import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  GithubRepoInfo,
  ProcessingStatus,
  ProcessROSResultDTO,
  PublishROSResultDTO,
  Risiko,
  ROS,
  ROSContentResultDTO,
  ROSWithMetadata,
  Scenario,
  SubmitResponseObject,
  Tiltak,
} from './types';
import useAsync from 'react-use/lib/useAsync';
import { emptyScenario, emptyTiltak } from './utilityfunctions';
import { konsekvensOptions, sannsynlighetOptions } from './constants';

const useGithubRepositoryInformation = (): GithubRepoInfo | null => {
  const currentEntity = useAsyncEntity();
  const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);

  useEffect(() => {
    if (!currentEntity.loading && currentEntity.entity !== undefined) {
      const slug =
        currentEntity.entity.metadata.annotations !== undefined
          ? currentEntity.entity.metadata.annotations[
              'github.com/project-slug'
            ].split('/')
          : null;

      if (slug === null) return;

      setRepoInfo({
        name: slug[1],
        owner: slug[0],
      });
    }
  }, [currentEntity.entity, currentEntity.loading]);

  return repoInfo;
};

const useResponse = (): [
  SubmitResponseObject | null,
  (submitStatus: SubmitResponseObject) => void,
] => {
  const [submitResponse, setSubmitResponse] =
    useState<SubmitResponseObject | null>(null);

  const displaySubmitResponse = (submitStatus: SubmitResponseObject) => {
    setSubmitResponse(submitStatus);
    setTimeout(() => {
      setSubmitResponse(null);
    }, 10000);
  };

  return [submitResponse, displaySubmitResponse];
};

const useFetch = (
  microsoftIdToken: string | undefined,
  googleAccessToken: string | undefined,
  repoInformation: GithubRepoInfo | null,
) => {
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const baseUri = useApi(configApiRef).getString('app.backendUrl');
  const rosUri = `${baseUri}/api/ros/${repoInformation?.owner}/${repoInformation?.name}`;
  const uriToFetchAllRoses = () => `${rosUri}/all`;
  const uriToFetchRos = (id: string) => `${rosUri}/${id}`;
  const uriToPublishROS = (id: string) => `${rosUri}/publish/${id}`;

  const [response, setResponse] = useResponse();

  const fetch = <T>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: T) => void,
    body?: string,
  ) => {
    if (repoInformation && microsoftIdToken && googleAccessToken) {
      fetchApi(uri, {
        method: method,
        headers: {
          'Microsoft-Id-Token': microsoftIdToken,
          'GCP-Access-Token': googleAccessToken,
          'Content-Type': 'application/json',
        },
        body: body,
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => json as T)
        .then(res => onSuccess(res))
        .catch(error => onError(error));
    }
  };

  const fetchRoses = (
    onSuccess: (response: ROSContentResultDTO[]) => void,
    onError?: () => void,
  ) =>
    fetch<ROSContentResultDTO[]>(uriToFetchAllRoses(), 'GET', onSuccess, () => {
      if (onError) onError();
      setResponse({
        statusMessage: 'Failed to fetch ROSes',
        status: ProcessingStatus.ErrorWhenFetchingROSes,
      });
    });

  const postROS = (
    ros: ROS,
    onSuccess?: (response: ProcessROSResultDTO) => void,
    onError?: (error: ProcessROSResultDTO) => void,
  ) =>
    fetch<ProcessROSResultDTO>(
      rosUri,
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
      JSON.stringify({ ros: JSON.stringify(ros) }),
    );

  const putROS = (
    ros: ROSWithMetadata,
    onSuccess?: (response: ProcessROSResultDTO) => void,
    onError?: (error: ProcessROSResultDTO) => void,
  ) =>
    fetch<ProcessROSResultDTO>(
      uriToFetchRos(ros.id),
      'PUT',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
      JSON.stringify({ ros: JSON.stringify(ros.content) }),
    );

  const publishROS = (
    rosId: string,
    onSuccess?: (response: PublishROSResultDTO) => void,
    onError?: (error: PublishROSResultDTO) => void,
  ) =>
    fetch<PublishROSResultDTO>(
      uriToPublishROS(rosId),
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
    );

  return { fetchRoses, postROS, putROS, publishROS, response };
};

export interface ScenarioDrawerProps {
  scenarioDrawerState: ScenarioDrawerState;
  openScenarioDrawerEdit: () => void;
  closeScenarioDrawer: () => void;

  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  originalScenario: Scenario;
  setOriginalScenario: (scenario: Scenario) => void;
  newScenario: () => void;
  openScenario: (id: string) => void;
  saveScenario: () => void;

  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: (id: string) => void;
  closeDeleteConfirmation: () => void;
  confirmDeletion: () => void;

  setTittel: (tittel: string) => void;
  setBeskrivelse: (beskrivelse: string) => void;
  setTrusselaktører: (trusselaktører: string[]) => void;
  setSårbarheter: (sårbarheter: string[]) => void;
  setSannsynlighet: (sannsynlighetLevel: number) => void;
  setKonsekvens: (konsekvensLevel: number) => void;
  addTiltak: () => void;
  updateTiltak: (tiltak: Tiltak) => void;
  deleteTiltak: (tiltak: Tiltak) => void;
  updateRestrisiko: (restrisiko: Risiko) => void;
}

export enum ScenarioDrawerState {
  Closed,
  Edit,
  View,
}

export const useScenarioDrawer = (
  ros: ROS | null,
  updateRos: (ros: ROS) => void,
): ScenarioDrawerProps => {
  const [scenarioDrawerState, setScenarioDrawerState] = useState(
    ScenarioDrawerState.Closed,
  );
  const [scenario, setScenario] = useState(emptyScenario());
  const [originalScenario, setOriginalScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const openScenarioDrawerEdit = () =>
    setScenarioDrawerState(ScenarioDrawerState.Edit);

  const closeScenarioDrawer = () => {
    setScenarioDrawerState(ScenarioDrawerState.Closed);
    setScenario(emptyScenario());
    setOriginalScenario(emptyScenario());
  };

  const saveScenario = () => {
    if (ros) {
      const updatedScenarios = ros.scenarier.some(s => s.ID === scenario.ID)
        ? ros.scenarier.map(s => (s.ID === scenario.ID ? scenario : s))
        : ros.scenarier.concat(scenario);
      updateRos({ ...ros, scenarier: updatedScenarios });
      closeScenarioDrawer();
      setScenario(emptyScenario());
      setOriginalScenario(emptyScenario());
    }
  };

  const openDeleteConfirmation = (id: string) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDeleteConfirmationIsOpen(true);
    }
  };

  const deleteScenario = (id: string) => {
    if (ros) {
      const updatedScenarios = ros.scenarier.filter(s => s.ID !== id);
      updateRos({ ...ros, scenarier: updatedScenarios });
    }
  };

  const confirmDeletion = () => {
    deleteScenario(scenario.ID);
  };

  const closeDeleteConfirmation = () => {
    if (ros) {
      setDeleteConfirmationIsOpen(false);
      setScenario(emptyScenario());
      setOriginalScenario(emptyScenario());
    }
  };

  const openScenario = (id: string) => {
    if (ros) {
      const currentScenario =
        ros.scenarier.find(s => s.ID === id) ?? emptyScenario();
      setScenario(currentScenario);
      setOriginalScenario(currentScenario);
      setScenarioDrawerState(ScenarioDrawerState.View);
    }
  };

  const newScenario = () => {
    setScenario(emptyScenario());
    setOriginalScenario(emptyScenario());
    openScenarioDrawerEdit();
  };

  const setTittel = (tittel: string) =>
    setScenario({
      ...scenario,
      tittel: tittel,
    });

  const setBeskrivelse = (beskrivelse: string) =>
    setScenario({
      ...scenario,
      beskrivelse: beskrivelse,
    });

  const setTrusselaktører = (trusselaktører: string[]) =>
    setScenario({
      ...scenario,
      trusselaktører: trusselaktører,
    });

  const setSårbarheter = (sårbarheter: string[]) =>
    setScenario({
      ...scenario,
      sårbarheter: sårbarheter,
    });

  const setSannsynlighet = (sannsynlighetLevel: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        sannsynlighet: sannsynlighetOptions[sannsynlighetLevel - 1],
      },
    });

  const setKonsekvens = (konsekvensLevel: number) =>
    setScenario({
      ...scenario,
      risiko: {
        ...scenario.risiko,
        konsekvens: konsekvensOptions[konsekvensLevel - 1],
      },
    });

  const addTiltak = () =>
    setScenario({ ...scenario, tiltak: [...scenario.tiltak, emptyTiltak()] });

  const updateTiltak = (tiltak: Tiltak) => {
    const updatedTiltak = scenario.tiltak.some(t => t.ID === tiltak.ID)
      ? scenario.tiltak.map(t => (t.ID === tiltak.ID ? tiltak : t))
      : [...scenario.tiltak, tiltak];
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  const deleteTiltak = (tiltak: Tiltak) => {
    const updatedTiltak = scenario.tiltak.filter(t => t.ID !== tiltak.ID);
    setScenario({ ...scenario, tiltak: updatedTiltak });
  };

  const updateRestrisiko = (restrisiko: Risiko) =>
    setScenario({ ...scenario, restrisiko });

  return {
    scenarioDrawerState,
    openScenarioDrawerEdit,
    closeScenarioDrawer,

    scenario,
    setScenario,
    originalScenario,
    setOriginalScenario,
    newScenario,
    openScenario,
    saveScenario,

    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeletion,

    setTittel,
    setBeskrivelse,
    setTrusselaktører,
    setSårbarheter,
    setSannsynlighet,
    setKonsekvens,
    addTiltak,
    updateTiltak,
    deleteTiltak,
    updateRestrisiko,
  };
};

export const useROSPlugin = () => {
  const microsoftAPI = useApi(microsoftAuthApiRef);
  const { value: idToken } = useAsync(() => microsoftAPI.getIdToken());

  const googleApi = useApi(googleAuthApiRef);
  const { value: accessToken } = useAsync(() =>
    googleApi.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloudkms',
    ]),
  );

  const repoInformation = useGithubRepositoryInformation();

  const { fetchRoses, postROS, putROS, publishROS, response } = useFetch(
    idToken,
    accessToken,
    repoInformation,
  );

  const useFetchRoses = (): {
    selectedROS: ROSWithMetadata | null;
    setSelectedROS: (ros: ROSWithMetadata | null) => void;
    roses: ROSWithMetadata[] | null;
    setRoses: (roses: ROSWithMetadata[]) => void;
    selectROSByTitle: (title: string) => void;
    isFetching: boolean;
    setIsFetching: (isFetching: boolean) => void;
  } => {
    const [roses, setRoses] = useState<ROSWithMetadata[] | null>(null);
    const [selectedROS, setSelectedROS] = useState<ROSWithMetadata | null>(
      null,
    );
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
      fetchRoses(
        res => {
          const fetchedRoses: ROSWithMetadata[] = res.map(rosDTO => {
            const content = JSON.parse(rosDTO.rosContent) as ROS;
            return {
              id: rosDTO.rosId,
              title: content.tittel,
              content: content,
              status: rosDTO.rosStatus,
            };
          });

          setRoses(fetchedRoses);
          setSelectedROS(fetchedRoses[0]);
          setIsFetching(false);
        },
        () => setIsFetching(false),
      );
    }, [idToken, accessToken]);

    const selectROSByTitle = (title: string) => {
      const pickedRos = roses?.find(ros => ros.title === title) || null;
      setSelectedROS(pickedRos);
    };

    return {
      selectedROS,
      setSelectedROS,
      roses,
      setRoses,
      selectROSByTitle,
      isFetching,
      setIsFetching,
    };
  };

  return {
    useFetchRoses,
    postROS,
    putROS,
    publishROS,
    response,
  };
};
