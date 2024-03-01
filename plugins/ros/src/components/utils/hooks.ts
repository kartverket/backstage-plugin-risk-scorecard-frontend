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
  ROS,
  ROSContentResultDTO,
  ROSWithMetadata,
  Scenario,
  SubmitResponseObject,
} from './types';
import useAsync from 'react-use/lib/useAsync';
import { emptyScenario } from './utilityfunctions';

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
    if (repoInformation && microsoftIdToken) {
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
        .then(response => onSuccess(response))
        .catch(error => onError(error));
    }
  };

  const fetchRoses = (onSuccess: (response: ROSContentResultDTO[]) => void) =>
    fetch<ROSContentResultDTO[]>(uriToFetchAllRoses(), 'GET', onSuccess, () =>
      setResponse({
        statusMessage: 'Failed to fetch ROSes',
        status: ProcessingStatus.ErrorWhenFetchingROSes,
      }),
    );

  const postROS = (
    ros: ROS,
    onSuccess?: (response: ProcessROSResultDTO) => void,
    onError?: (error: ProcessROSResultDTO) => void,
  ) =>
    fetch<ProcessROSResultDTO>(
      rosUri,
      'POST',
      response => {
        setResponse(response);
        if (onSuccess) onSuccess(response);
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
      response => {
        setResponse(response);
        if (onSuccess) onSuccess(response);
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
      response => {
        setResponse(response);
        if (onSuccess) onSuccess(response);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
    );

  return { fetchRoses, postROS, putROS, publishROS, response };
};

export const useScenarioDrawer = (
  ros: ROS | null,
  setDrawerIsOpen: (open: boolean) => void,
  onChange: (ros: ROS) => void,
): {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  saveScenario: () => void;
  editScenario: (id: string) => void;
  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: (id: string) => void;
  closeDeleteConfirmation: () => void;
  confirmDeletion: () => void;
} => {
  const [scenario, setScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const saveScenario = () => {
    if (ros) {
      const updatedScenarios = ros.scenarier.some(s => s.ID === scenario.ID)
        ? ros.scenarier.map(s => (s.ID === scenario.ID ? scenario : s))
        : ros.scenarier.concat(scenario);
      onChange({ ...ros, scenarier: updatedScenarios });
      setDrawerIsOpen(false);
      setScenario(emptyScenario());
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
      onChange({ ...ros, scenarier: updatedScenarios });
    }
  };

  const confirmDeletion = () => {
    deleteScenario(scenario.ID);
  };

  const closeDeleteConfirmation = () => {
    if (ros) {
      setDeleteConfirmationIsOpen(false);
      setScenario(emptyScenario());
    }
  };

  const editScenario = (id: string) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDrawerIsOpen(true);
    }
  };

  return {
    scenario,
    setScenario,
    saveScenario,
    editScenario,
    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeletion,
  };
};

export const useROSPlugin = () => {
  const microsoftAPI = useApi(microsoftAuthApiRef);
  const { value: idToken } = useAsync(() => microsoftAPI.getIdToken());

  const googleApi = useApi(googleAuthApiRef);
  const { value: accessToken } = useAsync(() => googleApi.getAccessToken());

  const repoInformation = useGithubRepositoryInformation();

  const { fetchRoses, postROS, putROS, publishROS, response } = useFetch(
    idToken,
    accessToken,
    repoInformation,
  );

  const useFetchRoses = (): {
    selectedROS: ROSWithMetadata | null;
    setSelectedROS: (ros: ROSWithMetadata) => void;
    roses: ROSWithMetadata[] | null;
    setRoses: (roses: ROSWithMetadata[]) => void;
    selectROSByTitle: (title: string) => void;
  } => {
    const [roses, setRoses] = useState<ROSWithMetadata[] | null>(null);
    const [selectedROS, setSelectedROS] = useState<ROSWithMetadata | null>(
      null,
    );

    useEffect(() => {
      fetchRoses(response => {
        const fetchedRoses: ROSWithMetadata[] = response.map(rosDTO => {
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
      });
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
