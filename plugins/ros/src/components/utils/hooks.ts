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
import { rosRouteRef, scenarioRouteRef } from '../../routes';
import { useLocation, useNavigate } from 'react-router';

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

  return { fetchRoses, postROS, putROS, publishROS, response, setResponse };
};

export interface ScenarioDrawerProps {
  scenarioDrawerState: ScenarioDrawerState;
  editScenario: () => void;

  scenario: Scenario;
  originalScenario: Scenario;
  newScenario: () => void;
  saveScenario: () => boolean;

  openScenario: (id: string) => void;
  closeScenario: () => void;

  scenarioErrors: ScenarioErrors;

  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: () => void;
  abortDeletion: () => void;
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
  ros: ROSWithMetadata | null,
  updateRos: (ros: ROS) => void,
  scenarioIdFromParams?: string,
): ScenarioDrawerProps => {
  // STATES
  const [scenarioDrawerState, setScenarioDrawerState] = useState(
    ScenarioDrawerState.Closed,
  );
  const [isNewScenario, setIsNewScenario] = useState(false);
  const [scenario, setScenario] = useState(emptyScenario());
  const [originalScenario, setOriginalScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const [scenarioErrors, setScenarioErrors] = useState(emptyScenarioErrors());
  const navigate = useNavigate();
  const getScenarioPath = useRouteRef(scenarioRouteRef);
  const getRosPath = useRouteRef(rosRouteRef);

  // Open scenario when url changes
  useEffect(() => {
    if (ros) {
      // If there is no scenario ID in the URL, close the drawer and reset the scenario to an empty state
      if (!scenarioIdFromParams) {
        setScenarioDrawerState(ScenarioDrawerState.Closed);
        const s = emptyScenario();
        setScenario(s);
        setOriginalScenario(s);
        setScenarioErrors(emptyScenarioErrors());
        return;
      }

      if (isNewScenario) {
        setScenarioDrawerState(ScenarioDrawerState.Edit);
        return;
      }

      const selectedScenario = ros.content.scenarier.find(
        s => s.ID === scenarioIdFromParams,
      );

      // If there is an invalid scenario ID in the URL, navigate to the ROS with error state
      if (!selectedScenario) {
        navigate(getRosPath({ rosId: ros.id }), {
          state: 'Risikoscenarioet eksisterer ikke',
        });
        return;
      }

      setScenario(selectedScenario);
      setOriginalScenario(selectedScenario);
      setScenarioDrawerState(ScenarioDrawerState.View);
    }
  }, [ros, scenarioIdFromParams]);

  // SCENARIO DRAWER FUNCTIONS
  const openScenario = (id: string) => {
    if (ros) {
      navigate(getScenarioPath({ rosId: ros.id, scenarioId: id }));
    }
  };

  const closeScenario = () => {
    if (ros) {
      setIsNewScenario(false);
      navigate(getRosPath({ rosId: ros.id }));
    }
  };

  const editScenario = () => setScenarioDrawerState(ScenarioDrawerState.Edit);

  const saveScenario = () => {
    if (ros) {
      setScenarioErrors({
        tittel: scenario.tittel === '' ? scenarioTittelError : null,
      });

      if (scenario.tittel !== '') {
        const updatedScenarios = ros.content.scenarier.some(
          s => s.ID === scenario.ID,
        )
          ? ros.content.scenarier.map(s =>
              s.ID === scenario.ID ? scenario : s,
            )
          : ros.content.scenarier.concat(scenario);
        updateRos({ ...ros.content, scenarier: updatedScenarios });
        closeScenario();
        return true;
      }
    }
    return false;
  };

  const openDeleteConfirmation = () => setDeleteConfirmationIsOpen(true);

  const abortDeletion = () => setDeleteConfirmationIsOpen(false);

  const confirmDeletion = () => {
    if (ros) {
      setDeleteConfirmationIsOpen(false);
      closeScenario();
      const updatedScenarios = ros.content.scenarier.filter(
        s => s.ID !== scenario.ID,
      );
      updateRos({ ...ros.content, scenarier: updatedScenarios });
    }
  };

  const newScenario = () => {
    if (ros) {
      setIsNewScenario(true);
      const s = emptyScenario();
      setScenario(s);
      setOriginalScenario(s);
      openScenario(s.ID);
    }
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

    scenario,
    originalScenario,
    newScenario,
    saveScenario,
    editScenario,

    openScenario,
    closeScenario,

    scenarioErrors,

    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    abortDeletion,
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

  const location = useLocation();
  const navigate = useNavigate();
  const getRosPath = useRouteRef(rosRouteRef);

  const repoInformation = useGithubRepositoryInformation();

  const { fetchRoses, postROS, putROS, publishROS, response, setResponse } =
    useFetch(idToken, accessToken, repoInformation);

  const [roses, setRoses] = useState<ROSWithMetadata[] | null>(null);
  const [selectedROS, setSelectedROS] = useState<ROSWithMetadata | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (location.state) {
      setResponse({
        statusMessage: location.state,
        status: ProcessingStatus.ErrorWhenFetchingROSes,
      });
    }
  }, [location]);

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
            state: 'ROS-analysen eksisterer ikke',
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
      const updatedROS = {
        ...selectedROS,
        content: ros,
        status:
          selectedROS.status !== RosStatus.Draft
            ? RosStatus.Draft
            : selectedROS.status,
      };
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
