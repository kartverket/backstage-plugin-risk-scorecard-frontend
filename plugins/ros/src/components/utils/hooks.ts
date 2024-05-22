import { useEntity } from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Action,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScStatus,
  RiScWithMetadata,
  Risk,
  Scenario,
  SubmitResponseObject,
} from './types';
import {
  emptyAction,
  emptyScenario,
  requiresNewApproval,
} from './utilityfunctions';
import { consequenceOptions, probabilityOptions } from './constants';
import { riScRouteRef, scenarioRouteRef } from '../../routes';
import { useLocation, useNavigate } from 'react-router';
import {
  dtoToRiSc,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  RiScDTO,
  riScToDTOString,
} from './DTOs';
import { useEffectOnce } from 'react-use';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizardSteps } from '../scenarioWizard/ScenarioWizard';

const useGithubRepositoryInformation = (): GithubRepoInfo => {
  const [, org, repo] =
    useEntity().entity.metadata.annotations?.['backstage.io/view-url'].match(
      /github\.com\/([^\/]+)\/([^\/]+)/,
    ) || [];

  return {
    owner: org,
    name: repo,
  };
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

const useFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const baseUri = useApi(configApiRef).getString('riskAssessment.baseUrl');
  const riScUri = `${baseUri}/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = () => `${riScUri}/all`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const uriToFetchLatestJSONSchema = () => `${baseUri}/api/risc/schemas/latest`;

  const [response, setResponse] = useResponse();

  const fetch = <T>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: T) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudkms',
      ]),
    ]).then(([idToken, googleAccessToken]) => {
      fetchApi(uri, {
        method: method,
        headers: {
          Authorization: `Bearer ${idToken.token}`,
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
    });
  };

  const fetchRiScs = (
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: () => void,
  ) =>
    fetch<RiScContentResultDTO[]>(
      uriToFetchAllRiScs(),
      'GET',
      onSuccess,
      () => {
        if (onError) onError();
        setResponse({
          statusMessage: 'Failed to fetch risc scorecards',
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
        });
      },
    );

  const fetchLatestJSONSchema = (
    onSuccess: (response: string) => void,
    onError?: () => void,
  ) =>
    fetch<string>(uriToFetchLatestJSONSchema(), 'GET', onSuccess, () => {
      if (onError) onError();
      setResponse({
        statusMessage:
          'Failed to fetch JSON schema. Fallback value 3.2 for schema version used',
        status: ProcessingStatus.ErrorWhenFetchingJSONSchema,
      });
    });

  const publishRiSc = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: PublishRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<PublishRiScResultDTO>(
        uriToPublishRiSc(riScId),
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        profileInfoToDTOString(profile),
      ),
    );

  const postRiSc = (
    riSc: RiSc,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
        riScUri,
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        riScToDTOString(riSc, true, profile),
      ),
    );

  const putRiSc = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
        uriToFetchRiSc(riSc.id),
        'PUT',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          if (onError) onError(error);
        },
        riScToDTOString(riSc.content, riSc.isRequiresNewApproval!!, profile),
      ),
    );
  };

  return {
    fetchRiScs: fetchRiScs,
    postRiScs: postRiSc,
    putRiScs: putRiSc,
    publishRiScs: publishRiSc,
    response,
    setResponse,
    fetchLatestJSONSchema,
  };
};

export interface ScenarioDrawerProps {
  scenarioDrawerState: ScenarioDrawerState;

  scenario: Scenario;
  originalScenario: Scenario;
  newScenario: () => void;
  saveScenario: () => boolean;
  editScenario: (step: ScenarioWizardSteps) => void;
  isNewScenario: boolean;

  openScenario: (id: string) => void;
  closeScenario: () => void;

  scenarioErrors: ScenarioErrors;
  validateScenario: () => boolean;

  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: () => void;
  abortDeletion: () => void;
  confirmDeletion: () => void;

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setThreatActors: (threatActors: string[]) => void;
  setVulnerabilities: (vulnerabilities: string[]) => void;
  setProbability: (probabilityLevel: number) => void;
  setConsequence: (consequenceLevel: number) => void;
  setExistingActions: (existingActions: string) => void;
  addAction: () => void;
  updateAction: (action: Action) => void;
  deleteAction: (action: Action) => void;
  updateRemainingRisk: (remainingRisk: Risk) => void;
  setRemainingProbability: (probabilityLevel: number) => void;
  setRemainingConsequence: (consequenceLevel: number) => void;
}

export enum ScenarioDrawerState {
  Closed,
  Edit,
  View,
}

type ScenarioErrors = {
  title: boolean;
};

const emptyScenarioErrors = (): ScenarioErrors => ({
  title: false,
});

export const useScenarioDrawer = (
  riSc: RiScWithMetadata | null,
  updateRiSc: (riSc: RiSc) => void,
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
  const [, setSearchParams] = useSearchParams();

  const [scenarioErrors, setScenarioErrors] = useState(emptyScenarioErrors());
  const navigate = useNavigate();
  const getScenarioPath = useRouteRef(scenarioRouteRef);
  const getRiScPath = useRouteRef(riScRouteRef);

  // Open scenario when url changes
  useEffect(() => {
    if (riSc) {
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
        // setScenarioDrawerState(ScenarioDrawerState.Edit);
        setSearchParams({ step: 'scenario' });
        return;
      }

      const selectedScenario = riSc.content.scenarios.find(
        s => s.ID === scenarioIdFromParams,
      );

      // If there is an invalid scenario ID in the URL, navigate to the RiSc with error state
      if (!selectedScenario) {
        navigate(getRiScPath({ riScId: riSc.id }), {
          state: 'Risikoscenarioet du prøver å åpne eksisterer ikke',
        });
        return;
      }

      setScenario(selectedScenario);
      setOriginalScenario(selectedScenario);
      setScenarioDrawerState(ScenarioDrawerState.View);
    }
  }, [riSc, scenarioIdFromParams]);

  // SCENARIO DRAWER FUNCTIONS
  const openScenario = (id: string) => {
    if (riSc) {
      navigate(getScenarioPath({ riScId: riSc.id, scenarioId: id }));
    }
  };

  const closeScenario = () => {
    if (riSc) {
      setIsNewScenario(false);
      navigate(getRiScPath({ riScId: riSc.id }));
    }
  };

  const editScenario = (step: ScenarioWizardSteps) => {
    setScenarioDrawerState(ScenarioDrawerState.Closed);
    setSearchParams({ step: step });
  };

  const validateScenario = () => {
    if (scenario.title === '') {
      setScenarioErrors({
        ...scenarioErrors,
        title: true,
      });
      return false;
    }
    return true;
  };

  const saveScenario = () => {
    if (riSc) {
      if (validateScenario()) {
        const updatedScenarios = riSc.content.scenarios.some(
          s => s.ID === scenario.ID,
        )
          ? riSc.content.scenarios.map(s =>
              s.ID === scenario.ID ? scenario : s,
            )
          : riSc.content.scenarios.concat(scenario);
        updateRiSc({ ...riSc.content, scenarios: updatedScenarios });
        return true;
      }
    }
    return false;
  };

  const openDeleteConfirmation = () => setDeleteConfirmationIsOpen(true);

  const abortDeletion = () => setDeleteConfirmationIsOpen(false);

  const confirmDeletion = () => {
    if (riSc) {
      setDeleteConfirmationIsOpen(false);
      closeScenario();
      const updatedScenarios = riSc.content.scenarios.filter(
        s => s.ID !== scenario.ID,
      );
      updateRiSc({ ...riSc.content, scenarios: updatedScenarios });
    }
  };

  const newScenario = () => {
    if (riSc) {
      setIsNewScenario(true);
      const s = emptyScenario();
      setScenario(s);
      setOriginalScenario(s);
      openScenario(s.ID);
    }
  };

  // UPDATE SCENARIO FUNCTIONS

  const setTitle = (title: string) => {
    setScenarioErrors({
      ...scenarioErrors,
      title: false,
    });
    setScenario({
      ...scenario,
      title: title,
    });
  };

  const setDescription = (description: string) => {
    setScenario({
      ...scenario,
      description: description,
    });
  };

  const setThreatActors = (threatActors: string[]) => {
    setScenario({
      ...scenario,
      threatActors: threatActors,
    });
  };

  const setVulnerabilities = (vulnerabilities: string[]) => {
    setScenario({
      ...scenario,
      vulnerabilities: vulnerabilities,
    });
  };

  const setProbability = (probabilityLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
    });

  const setConsequence = (consequenceLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
    });

  const setExistingActions = (existingActions: string) => {
    setScenario({
      ...scenario,
      existingActions: existingActions,
    });
  };

  const addAction = () =>
    setScenario({ ...scenario, actions: [...scenario.actions, emptyAction()] });

  const updateAction = (action: Action) => {
    const updatedAction = scenario.actions.some(a => a.ID === action.ID)
      ? scenario.actions.map(a => (a.ID === action.ID ? action : a))
      : [...scenario.actions, action];
    setScenario({ ...scenario, actions: updatedAction });
  };

  const deleteAction = (action: Action) => {
    const updatedAction = scenario.actions.filter(a => a.ID !== action.ID);
    setScenario({ ...scenario, actions: updatedAction });
  };

  const updateRemainingRisk = (remainingRisk: Risk) =>
    setScenario({ ...scenario, remainingRisk: remainingRisk });

  const setRemainingProbability = (probabilityLevel: number) =>
    setScenario({
      ...scenario,
      remainingRisk: {
        ...scenario.remainingRisk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
    });

  const setRemainingConsequence = (consequenceLevel: number) =>
    setScenario({
      ...scenario,
      remainingRisk: {
        ...scenario.remainingRisk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
    });

  return {
    scenarioDrawerState,

    scenario,
    originalScenario,
    newScenario,
    saveScenario,
    editScenario,
    isNewScenario,

    openScenario,
    closeScenario,

    scenarioErrors,
    validateScenario,

    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    abortDeletion,
    confirmDeletion,

    setTitle,
    setDescription,
    setThreatActors,
    setVulnerabilities,
    setProbability,
    setConsequence,
    setExistingActions,
    addAction,
    updateAction,
    deleteAction,
    updateRemainingRisk,
    setRemainingProbability,
    setRemainingConsequence,
  };
};

export const useFetchRiScs = (
  riScIdFromParams?: string,
): {
  selectedRiSc: RiScWithMetadata | null;
  riScs: RiScWithMetadata[] | null;
  selectRiSc: (title: string) => void;
  isFetching: boolean;
  createNewRiSc: (riSc: RiSc) => void;
  updateRiSc: (riSc: RiSc) => void;
  updateRiScStatus: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  resetRiScStatus: () => void;
  approveRiSc: () => void;
  response: SubmitResponseObject | null;
} => {
  const location = useLocation();
  const navigate = useNavigate();
  const getRiScPath = useRouteRef(riScRouteRef);

  const {
    fetchRiScs,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    fetchLatestJSONSchema,
  } = useFetch();

  const [riScs, setRiScs] = useState<RiScWithMetadata[] | null>(null);
  const [selectedRiSc, setSelectedRiSc] = useState<RiScWithMetadata | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [updateRiScStatus, setUpdateRiScStatus] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  useEffect(() => {
    if (location.state) {
      setResponse({
        statusMessage: location.state,
        status: ProcessingStatus.ErrorWhenFetchingRiScs,
      });
    }
  }, [location]);

  // Initial fetch of RiScs
  useEffectOnce(() => {
    fetchRiScs(
      res => {
        const fetchedRiScs: RiScWithMetadata[] = res.map(riScDTO => {
          const content = dtoToRiSc(JSON.parse(riScDTO.riScContent) as RiScDTO);
          return {
            id: riScDTO.riScId,
            content: content,
            status: riScDTO.riScStatus,
          };
        });

        setRiScs(fetchedRiScs);
        setIsFetching(false);

        // If there are no RiScs, don't set a selected RiSc
        if (fetchedRiScs.length === 0) {
          return;
        }

        // If there is no RiSc ID in the URL, navigate to the first RiSc
        if (!riScIdFromParams) {
          navigate(getRiScPath({ riScId: fetchedRiScs[0].id }));
          return;
        }

        const riSc = fetchedRiScs.find(r => r.id === riScIdFromParams);

        // If there is an invalid RiSc ID in the URL, navigate to the first RiSc with error state
        if (!riSc) {
          navigate(getRiScPath({ riScId: fetchedRiScs[0].id }), {
            state: 'The risk scorecard you are trying to open does not exist',
          });
          return;
        }
      },
      () => setIsFetching(false),
    );
  });

  // Set selected RiSc based on URL
  useEffect(() => {
    if (riScIdFromParams) {
      const riSc = riScs?.find(r => r.id === riScIdFromParams);
      if (riSc) {
        setSelectedRiSc(riSc);
      }
    }
  }, [riScs, riScIdFromParams]);

  const resetRiScStatus = () =>
    setUpdateRiScStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });

  const selectRiSc = (title: string) => {
    const riScId = riScs?.find(riSc => riSc.content.title === title)?.id;
    if (riScId) {
      navigate(getRiScPath({ riScId: riScId }));
    }
  };

  const createNewRiSc = (riSc: RiSc) => {
    setIsFetching(true);
    setSelectedRiSc(null);
    fetchLatestJSONSchema(
      res => {
        const resString = JSON.stringify(res);
        const schema = JSON.parse(resString);
        const schemaVersion = schema.properties.schemaVersion.default.replace(
          /'/g,
          '',
        );
        const newRiSc: RiSc = {
          ...riSc,
          schemaVersion: schemaVersion ? schemaVersion : '3.2',
        };

        postRiScs(
          newRiSc,
          res2 => {
            if (!res2.riScId) throw new Error('No RiSc ID returned');

            const RiScWithLatestSchemaVersion = {
              id: res2.riScId,
              status: RiScStatus.Draft,
              content: riSc,
              schemaVersion: riSc.schemaVersion,
            };

            setRiScs(
              riScs
                ? [...riScs, RiScWithLatestSchemaVersion]
                : [RiScWithLatestSchemaVersion],
            );
            setSelectedRiSc(RiScWithLatestSchemaVersion);
            setIsFetching(false);
            navigate(getRiScPath({ riScId: res2.riScId }));
          },
          () => {
            setSelectedRiSc(selectedRiSc);
            setIsFetching(false);
          },
        );
      },
      () => {
        const fallBackSchemaVersion = '3.2';
        const newRiSc: RiSc = {
          ...riSc,
          schemaVersion: fallBackSchemaVersion,
        };
        postRiScs(
          newRiSc,
          res2 => {
            if (!res2.riScId) throw new Error('No RiSc ID returned');

            const RiScWithLatestSchemaVersion = {
              id: res2.riScId,
              status: RiScStatus.Draft,
              content: riSc,
              schemaVersion: riSc.schemaVersion,
            };

            setRiScs(
              riScs
                ? [...riScs, RiScWithLatestSchemaVersion]
                : [RiScWithLatestSchemaVersion],
            );
            setSelectedRiSc(RiScWithLatestSchemaVersion);
            setIsFetching(false);
            navigate(getRiScPath({ riScId: res2.riScId }));
          },
          () => {
            setSelectedRiSc(selectedRiSc);
            setIsFetching(false);
          },
        );
      },
    );
  };

  const updateRiSc = (riSc: RiSc) => {
    if (selectedRiSc && riScs) {
      const isRequiresNewApproval = requiresNewApproval(
        selectedRiSc.content,
        riSc,
      );
      const updatedRiSc = {
        ...selectedRiSc,
        content: riSc,
        status:
          selectedRiSc.status !== RiScStatus.Draft && isRequiresNewApproval
            ? RiScStatus.Draft
            : selectedRiSc.status,
        isRequiresNewApproval: isRequiresNewApproval,
        schemaVersion: riSc.schemaVersion,
      };

      setUpdateRiScStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      putRiScs(
        updatedRiSc,
        () => {
          setUpdateRiScStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          setSelectedRiSc(updatedRiSc);
          setRiScs(
            riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)),
          );
        },
        () => {
          setUpdateRiScStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
        },
      );
    }
  };

  const approveRiSc = () => {
    if (selectedRiSc && riScs) {
      const updatedRiSc = {
        ...selectedRiSc,
        status: RiScStatus.SentForApproval,
      };

      publishRiScs(selectedRiSc.id, () => {
        setSelectedRiSc(updatedRiSc);
        setRiScs(riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)));
      });
    }
  };

  return {
    selectedRiSc: selectedRiSc,
    riScs: riScs,
    selectRiSc: selectRiSc,
    isFetching,
    updateRiScStatus: updateRiScStatus,
    resetRiScStatus: resetRiScStatus,
    createNewRiSc: createNewRiSc,
    updateRiSc: updateRiSc,
    approveRiSc: approveRiSc,
    response,
  };
};
