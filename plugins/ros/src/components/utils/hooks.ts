import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  useApi,
  githubAuthApiRef,
} from '@backstage/core-plugin-api';

import { ROSProcessingStatus, ROSProcessResultDTO } from './types';
import useAsync from 'react-use/lib/useAsync';
import {
  emptyScenario,
  GithubRepoInfo,
  ROS,
  ROSTitleAndIdAndStatus,
  ROSWrapper,
  Scenario,
} from './interfaces';

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
  const uriToFetchAllRoses = () => `${rosUri}/all`;
  const uriToFetchRos = (id: string) => `${rosUri}/${id}`;
  const uriToPublishROS = (id: string) => `${rosUri}/publish/${id}`;

  const githubPostRequestHeaders = (token: string): HeadersInit => ({
    'Github-Access-Token': token,
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

  const fetchRoses = (onSuccess: (rosWrapper: ROSWrapper[]) => void) => {
    fetch<ROSWrapper[]>(
      uriToFetchAllRoses(),
      'GET',
      onSuccess,
      (_: ROSWrapper[]) => {
        setResponse({
          statusMessage: 'Failed to fetch ROSes',
          status: ROSProcessingStatus.ROSNotValid,
        });
      },
    );
  };

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
  const GHApi = useApi(githubAuthApiRef);
  const { value: accessToken } = useAsync(() => GHApi.getAccessToken('repo'));
  const repoInformation = useGithubRepositoryInformation();

  const { fetchRoses, postROS, putROS, publishROS, response } = useFetch(
    accessToken,
    repoInformation,
  );

  const useFetchRoses = (): [
    ROS | null,
    (ros: ROS | null) => void,
    ROSTitleAndIdAndStatus[] | null,
    (titlesAndIds: ROSTitleAndIdAndStatus[] | null) => void,
    ROSTitleAndIdAndStatus | null,
    (title: string) => void,
  ] => {
    const [roses, setRoses] = useState<ROS[] | null>(null);
    const [selectedROS, setSelectedROS] = useState<ROS | null>(null);
    const [titlesAndIds, setTitlesAndIds] = useState<
      ROSTitleAndIdAndStatus[] | null
    >(null);
    const [selectedTitleAndId, setSelectedTitleAndId] =
      useState<ROSTitleAndIdAndStatus | null>(null);

    useEffect(() => {
      fetchRoses((res: ROSWrapper[]) => {
        const fetchedRoses: ROSWrapper[] = res.map((item: any) => ({
          id: item.rosId,
          content: JSON.parse(item.rosContent) as ROS,
          status: item.rosStatus,
        }));

        setRoses(fetchedRoses.map((ros: ROSWrapper) => ros.content as ROS));

        setTitlesAndIds(
          fetchedRoses.map((ros: ROSWrapper) => ({
            title: ros.content.tittel,
            id: ros.id,
            status: ros.status,
          })),
        );

        setSelectedTitleAndId({
          title: fetchedRoses[0].content.tittel,
          id: fetchedRoses[0].id,
          status: fetchedRoses[0].status,
        });

        setSelectedROS(
          fetchedRoses.length > 0 ? (fetchedRoses[0].content as ROS) : null,
        );
        return fetchedRoses;
      });
    }, [accessToken]);

    const selectROSByTitle = (title: string) => {
      const pickedRos = roses?.find(ros => ros.tittel === title) || null;
      const pickedTitleAndId =
        titlesAndIds?.find(t => t.title === title) || null;
      setSelectedROS(pickedRos);
      setSelectedTitleAndId(pickedTitleAndId);
    };

    return [
      selectedROS,
      setSelectedROS,
      titlesAndIds,
      setTitlesAndIds,
      selectedTitleAndId,
      selectROSByTitle,
    ];
  };

  return {
    useFetchRoses,
    postROS,
    putROS,
    publishROS,
    response,
  };
};
