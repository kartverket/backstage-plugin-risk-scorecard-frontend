import { GithubRepoInfo, ROS } from '../interface/interfaces';
import {
  githubGetRequestHeaders,
  uriToFetchRos,
  uriToFetchRosIds,
} from './utilityfunctions';
import {
  ROSContentResultDTO,
  RosIdentifierResponseDTO,
  ROSProcessResultDTO,
} from './types';
import { useBaseUrl } from './hooks';
import {
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

const useFetch = () => {
  const { fetch } = useApi(fetchApiRef);
  const GHApi = useApi(githubAuthApiRef);
  const baseUrl = useBaseUrl();
  const { value: accessToken } = useAsync(() => GHApi.getAccessToken('repo'));

  const fetchROSIds = (
    repoInformation: GithubRepoInfo | null,
    onSuccess: (arg: RosIdentifierResponseDTO) => void,
  ) => {
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
    repoInformation: GithubRepoInfo | null,
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
    repoInfo: GithubRepoInfo | null,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => {
    if (repoInfo && accessToken) {
      fetch(`${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Github-Access-Token': accessToken,
        },
        body: JSON.stringify({ ros: JSON.stringify(newRos) }),
      })
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

  return { fetchROSIds, fetchROS, postROS };
};
