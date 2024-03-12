import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  GithubRepoInfo,
  ProcessingStatus,
  ProcessROSResultDTO,
  PublishROSResultDTO,
  Risiko,
  ROS,
  ROSContentResultDTO,
  RosStatus,
  ROSWithMetadata,
  Scenario,
  SubmitResponseObject,
  Tiltak,
} from './types';
import useAsync from 'react-use/lib/useAsync';
import { emptyScenario, emptyTiltak } from './utilityfunctions';
import {
  konsekvensOptions,
  sannsynlighetOptions,
  scenarioTittelError,
} from './constants';
import { rosRouteRef } from '../../routes';
import { useNavigate } from 'react-router';

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
  saveScenario: () => boolean;

  scenarioErrors: ScenarioErrors;

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

type ScenarioErrors = {
  tittel: string | null;
};

const emptyScenarioErrors = (): ScenarioErrors => ({
  tittel: null,
});

export const useScenarioDrawer = (
  ros: ROS | null,
  updateRos: (ros: ROS) => void,
  scenarioIdFromParams?: string,
): ScenarioDrawerProps => {
  // STATES

  const [scenarioDrawerState, setScenarioDrawerState] = useState(
    ScenarioDrawerState.Closed,
  );
  const [scenario, setScenario] = useState(emptyScenario());
  const [originalScenario, setOriginalScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const [scenarioErrors, setScenarioErrors] = useState(emptyScenarioErrors());

  useEffect(() => {
    if (scenarioIdFromParams) {
      const selectedScenario = ros?.scenarier.find(
        s => s.ID === scenarioIdFromParams,
      );
      if (selectedScenario) {
        setScenario(selectedScenario);
        setOriginalScenario(selectedScenario);
        setScenarioDrawerState(ScenarioDrawerState.View);
      }
    }
  }, [ros, scenarioIdFromParams]);

  // SCENARIO DRAWER FUNCTIONS

  const openScenarioDrawerEdit = () =>
    setScenarioDrawerState(ScenarioDrawerState.Edit);

  const closeScenarioDrawer = () => {
    setScenarioDrawerState(ScenarioDrawerState.Closed);
    setScenario(emptyScenario());
    setOriginalScenario(emptyScenario());
    setScenarioErrors(emptyScenarioErrors());
  };

  const saveScenario = () => {
    if (ros) {
      setScenarioErrors({
        tittel: scenario.tittel === '' ? scenarioTittelError : null,
      });

      if (scenario.tittel !== '') {
        const updatedScenarios = ros.scenarier.some(s => s.ID === scenario.ID)
          ? ros.scenarier.map(s => (s.ID === scenario.ID ? scenario : s))
          : ros.scenarier.concat(scenario);
        updateRos({ ...ros, scenarier: updatedScenarios });
        closeScenarioDrawer();
        setScenario(emptyScenario());
        setOriginalScenario(emptyScenario());
        return true;
      }
    }
    return false;
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
    closeScenarioDrawer();
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmationIsOpen(false);
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

  // UPDATE SCENARIO FUNCTIONS

  const setTittel = (tittel: string) => {
    setScenarioErrors({
      ...scenarioErrors,
      tittel: null,
    });
    setScenario({
      ...scenario,
      tittel: tittel,
    });
  };

  const setBeskrivelse = (beskrivelse: string) => {
    setScenario({
      ...scenario,
      beskrivelse: beskrivelse,
    });
  };

  const setTrusselaktører = (trusselaktører: string[]) => {
    setScenario({
      ...scenario,
      trusselaktører: trusselaktører,
    });
  };

  const setSårbarheter = (sårbarheter: string[]) => {
    setScenario({
      ...scenario,
      sårbarheter: sårbarheter,
    });
  };

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

    scenarioErrors,

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

export const useFetchRoses = (
  rosIdFromParams?: string,
): {
  selectedROS: ROSWithMetadata | null;
  roses: ROSWithMetadata[] | null;
  selectRos: (title: string) => void;
  isFetching: boolean;
  createNewROS: (ros: ROS) => void;
  updateROS: (ros: ROS) => void;
  approveROS: () => void;
  response: SubmitResponseObject | null;
} => {
  const microsoftAPI = useApi(microsoftAuthApiRef);
  const { value: idToken } = useAsync(() => microsoftAPI.getIdToken());

  const googleApi = useApi(googleAuthApiRef);
  const { value: accessToken } = useAsync(() =>
    googleApi.getAccessToken([
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloudkms',
    ]),
  );

  const navigate = useNavigate();
  const getRosPath = useRouteRef(rosRouteRef);

  const repoInformation = useGithubRepositoryInformation();

  const { fetchRoses, postROS, putROS, publishROS, response } = useFetch(
    idToken,
    accessToken,
    repoInformation,
  );

  const [roses, setRoses] = useState<ROSWithMetadata[] | null>(null);
  const [selectedROS, setSelectedROS] = useState<ROSWithMetadata | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Initial fetch of ROSes
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
        setIsFetching(false);

        // If there are no ROSes, don't set a selected ROS
        if (fetchedRoses.length === 0) {
          return;
        }

        // If there is no ROS ID in the URL, navigate to the first ROS
        if (!rosIdFromParams) {
          navigate(getRosPath({ rosId: fetchedRoses[0].id }));
          return;
        }

        const ros = fetchedRoses.find(r => r.id === rosIdFromParams);

        // If there is an invalid ROS ID in the URL, navigate to the first ROS with error state
        if (!ros) {
          navigate(getRosPath({ rosId: fetchedRoses[0].id }), {
            state: 'Ugyldig ROS id',
          });
          return;
        }
      },
      () => setIsFetching(false),
    );
  }, [accessToken, idToken]);

  // Set selected ROS based on URL
  useEffect(() => {
    if (rosIdFromParams) {
      const ros = roses?.find(r => r.id === rosIdFromParams);
      if (ros) {
        setSelectedROS(ros);
      }
    }
  }, [roses, rosIdFromParams]);

  const selectRos = (title: string) => {
    const rosId = roses?.find(ros => ros.title === title)?.id;
    if (rosId) {
      navigate(getRosPath({ rosId }));
    }
  };

  const createNewROS = (ros: ROS) => {
    setIsFetching(true);
    setSelectedROS(null);
    postROS(
      ros,
      res => {
        if (!res.rosId) throw new Error('No ROS ID returned');

        const newROS = {
          id: res.rosId,
          title: ros.tittel,
          status: RosStatus.Draft,
          content: ros,
        };

        setRoses(roses ? [...roses, newROS] : [newROS]);
        setSelectedROS(newROS);
        setIsFetching(false);
        navigate(getRosPath({ rosId: res.rosId }));
      },
      () => {
        setSelectedROS(selectedROS);
        setIsFetching(false);
      },
    );
  };

  const updateROS = (ros: ROS) => {
    if (selectedROS && roses) {
      const updatedROS = { ...selectedROS, content: ros };
      setSelectedROS(updatedROS);
      setRoses(roses.map(r => (r.id === selectedROS.id ? updatedROS : r)));
      putROS(updatedROS);
    }
  };

  const approveROS = () => {
    if (selectedROS && roses) {
      const updatedROS = {
        ...selectedROS,
        status: RosStatus.SentForApproval,
      };
      setSelectedROS(updatedROS);
      setRoses(roses.map(r => (r.id === selectedROS.id ? updatedROS : r)));
      publishROS(selectedROS.id);
    }
  };

  return {
    selectedROS,
    roses,
    selectRos,
    isFetching,
    createNewROS,
    updateROS,
    approveROS,
    response,
  };
};
