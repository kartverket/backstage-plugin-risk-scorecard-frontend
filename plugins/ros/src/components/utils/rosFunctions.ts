import { GithubRepoInfo, ROS } from '../interface/interfaces';
import {
  githubGetRequestHeaders,
  githubPostRequestHeaders,
  uriToFetchRos,
  uriToFetchRosIds,
  uriToPutROS,
} from './utilityfunctions';
import {
  ROSContentResultDTO,
  RosIdentifierResponseDTO,
  ROSProcessResultDTO,
} from './types';
import { useGithubRepositoryInformation } from './hooks';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useFetch = () => {
  const { fetch } = useApi(fetchApiRef);
  const GHApi = useApi(githubAuthApiRef);
  const baseUrl = useApi(configApiRef).getString('app.backendUrl');
  const { value: accessToken } = useAsync(() => GHApi.getAccessToken('repo'));
  const repoInformation = useGithubRepositoryInformation();

  const fetch = (
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => {};

  const uriToFetchRos = (
    baseUrl: string,
    repoInformation: GithubRepoInfo,
    selectedId: string,
  ) =>
    `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`;

  const uriToPutROS = (
    baseUrl: string,
    repoInformation: GithubRepoInfo,
    selectedId: string,
  ) =>
    `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`;

  const uriToPublishROS = (
    baseUrl: string,
    repoInformation: GithubRepoInfo,
    selectedId: string,
  ) =>
    `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/publish/${selectedId}`;

  const fetchROSIds = (onSuccess: (arg: RosIdentifierResponseDTO) => void) => {
    if (accessToken && repoInformation) {
      fetch(uriToFetchRosIds(baseUrl, repoInformation), {
        headers: githubGetRequestHeaders(accessToken),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => json as RosIdentifierResponseDTO)
        .then(rosIdentifiersResponseDTO => onSuccess(rosIdentifiersResponseDTO))
        .catch(error => console.error('Kunne ikke hente ROS-ider:', error));
    }
  };

  const fetchROS = (
    selectedId: string | null,
    onSuccess: (arg: ROS) => void,
  ) => {
    if (selectedId && accessToken && repoInformation) {
      fetch(uriToFetchRos(baseUrl, repoInformation, selectedId), {
        headers: githubGetRequestHeaders(accessToken),
      })
        .then(res => res.json())
        .then(json => json as ROSContentResultDTO)
        .then(fetchedRos => {
          if (fetchedRos.rosContent !== null) {
            const rosContent = JSON.parse(fetchedRos.rosContent) as ROS;
            onSuccess(rosContent);
          } else
            console.log(
              `Kunne ikke hente ros med status: ${fetchedRos.status}`,
            );
        });
    }
  };

  const postROS = (
    newRos: ROS,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => {
    if (repoInformation && accessToken) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}`,
        {
          method: 'POST',
          headers: githubPostRequestHeaders(accessToken),
          body: JSON.stringify({ ros: JSON.stringify(newRos) }),
        },
      )
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          res.text().then(text => onError(text));
          return null;
        })
        .then(json => json as ROSProcessResultDTO)
        .then(processingResult => {
          onSuccess(processingResult);
        });
    }
  };

  const putROS = (
    updatedROS: ROS,
    rosId: string,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => {
    if (repoInformation && accessToken && rosId) {
      fetch(uriToPutROS(baseUrl, repoInformation, rosId), {
        method: 'PUT',
        headers: githubPostRequestHeaders(accessToken),
        body: JSON.stringify({ ros: JSON.stringify(updatedROS) }),
      }).then(res => onSuccess(res as ROSProcessResultDTO));
    }
  };

  return { fetchROSIds, fetchROS, postROS };
};
