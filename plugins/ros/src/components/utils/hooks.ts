import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  ROSContentResultDTO,
  RosIdentifier,
  RosIdentifierResponseDTO,
  ROSProcessingStatus,
  ROSProcessResultDTO,
} from './types';
import useAsync from 'react-use/lib/useAsync';
import { emptyScenario, GithubRepoInfo, ROS, Scenario } from './interfaces';

export interface SubmitResponseObject {
  statusMessage: string;
  status: ROSProcessingStatus;
}

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
  accessToken: string | undefined,
  repoInformation: GithubRepoInfo | null,
) => {
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const baseUri = useApi(configApiRef).getString('app.backendUrl');
  const rosUri = `${baseUri}/api/ros/${repoInformation?.owner}/${repoInformation?.name}`;
  const uriToFetchRosIds = () => `${rosUri}/ids`;
  const uriToFetchRos = (id: string) => `${rosUri}/${id}`;
  const uriToPublishROS = (id: string) => `${rosUri}/publish/${id}`;

  const githubPostRequestHeaders = (accessToken: string): HeadersInit => ({
    'Github-Access-Token': accessToken,
    'Content-Type': 'application/json',
  });

  const [response, setResponse] = useResponse();

  const fetch = <T>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (arg: T) => void,
    onError: (error: T) => void,
    body?: string,
  ) => {
    if (repoInformation && accessToken) {
      fetchApi(uri, {
        method: method,
        headers: githubPostRequestHeaders(accessToken),
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

  const fetchROSIds = (onSuccess: (rosIds: RosIdentifier[]) => void) =>
    fetch<RosIdentifierResponseDTO>(
      uriToFetchRosIds(),
      'GET',
      (res: RosIdentifierResponseDTO) => onSuccess(res.rosIds),
      (error: RosIdentifierResponseDTO) =>
        console.error('Kunne ikke hente ROS-ider:', error),
    );

  const fetchROS = (rosId: string, onSuccess: (ros: ROS) => void): void =>
    fetch<ROSContentResultDTO>(
      uriToFetchRos(rosId),
      'GET',
      (res: ROSContentResultDTO) => {
        switch (res.rosContent) {
          case null:
            throw new Error(`Kunne ikke hente ros med status: ${res.status}`);
          default:
            onSuccess(JSON.parse(res.rosContent) as ROS);
        }
      },
      (error: ROSContentResultDTO) => console.error(error),
    );

  const postROS = (
    ros: ROS,
    onSuccess?: (arg: ROSProcessResultDTO) => void,
    onError?: (error: ROSProcessResultDTO) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      rosUri,
      'POST',
      (arg: ROSProcessResultDTO) => {
        setResponse(arg);
        if (onSuccess) onSuccess(arg);
      },
      (error: ROSProcessResultDTO) => {
        setResponse(error);
        if (onError) onError(error);
      },
      JSON.stringify({ ros: JSON.stringify(ros) }),
    );

  const putROS = (
    ros: ROS,
    rosId: string,
    onSuccess?: (arg: ROSProcessResultDTO) => void,
    onError?: (error: ROSProcessResultDTO) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      uriToFetchRos(rosId),
      'PUT',
      (arg: ROSProcessResultDTO) => {
        setResponse(arg);
        if (onSuccess) onSuccess(arg);
      },
      (error: ROSProcessResultDTO) => {
        setResponse(error);
        if (onError) onError(error);
      },
      JSON.stringify({ ros: JSON.stringify(ros) }),
    );

  const publishROS = (
    rosId: string,
    onSuccess?: (arg: ROSProcessResultDTO) => void,
    onError?: (error: ROSProcessResultDTO) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      uriToPublishROS(rosId),
      'POST',
      (arg: ROSProcessResultDTO) => {
        setResponse(arg);
        if (onSuccess) onSuccess(arg);
      },
      (error: ROSProcessResultDTO) => {
        setResponse(error);
        if (onError) onError(error);
      },
    );

  return { fetchROSIds, fetchROS, postROS, putROS, publishROS, response };
};

export const useScenarioDrawer = (
  ros: ROS | undefined,
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
    }
  };

  const openDeleteConfirmation = (id: string) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDeleteConfirmationIsOpen(true);
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

  const deleteScenario = (id: string) => {
    if (ros) {
      const updatedScenarios = ros.scenarier.filter(s => s.ID !== id);
      onChange({ ...ros, scenarier: updatedScenarios });
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
  const GHApi = useApi(githubAuthApiRef);
  const { value: accessToken } = useAsync(() => GHApi.getAccessToken('repo'));
  const repoInformation = useGithubRepositoryInformation();

  const { fetchROSIds, fetchROS, postROS, putROS, publishROS, response } =
    useFetch(accessToken, repoInformation);

  const useFetchRos = (
    selectedId: RosIdentifier | null,
  ): [ROS | undefined, Dispatch<SetStateAction<ROS | undefined>>] => {
    const [ros, setRos] = useState<ROS>();

    useEffect(() => {
      if (selectedId) {
        fetchROS(selectedId.id, (fetchedROS: ROS) => setRos(fetchedROS));
      }
    }, [selectedId, accessToken, repoInformation]);

    return [ros, setRos];
  };

  const useFetchRosIds = (): [
    RosIdentifier | null,
    Dispatch<SetStateAction<RosIdentifier | null>>,
    RosIdentifier[] | null,
    Dispatch<SetStateAction<RosIdentifier[] | null>>,
  ] => {
    const [rosIds, setRosIds] = useState<RosIdentifier[] | null>(null);
    const [selectedId, setSelectedId] = useState<RosIdentifier | null>(null);

    useEffect(() => {
      try {
        fetchROSIds((rosIds: RosIdentifier[]) => {
          setRosIds(rosIds);
          setSelectedId(rosIds[0]);
        });
      } catch (error) {
        // Handle any synchronous errors that might occur outside the promise chain
        console.error('Unexpected error:', error);
      }
    }, [accessToken, repoInformation]);

    return [selectedId, setSelectedId, rosIds, setRosIds];
  };

  return {
    useFetchRos,
    useFetchRosIds,
    postROS,
    putROS,
    publishROS,
    response,
  };
};
