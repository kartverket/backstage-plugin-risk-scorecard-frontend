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

export const fetchROSIds = (
  baseUrl: string,
  ghAccessToken: string | null,
  repoInformation: GithubRepoInfo | null,
  onSuccess: (arg: RosIdentifierResponseDTO) => void,
  fetchFn: typeof fetch,
) => {
  if (ghAccessToken && repoInformation) {
    fetchFn(uriToFetchRosIds(baseUrl, repoInformation), {
      headers: githubGetRequestHeaders(ghAccessToken),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(json => json as RosIdentifierResponseDTO)
      .then(rosIdentifiersResponseDTO => {
        onSuccess(rosIdentifiersResponseDTO);
      })
      .catch(error => console.error('Kunne ikke hente ROS-ider:', error));
  }
};

export const fetchROS = (
  baseUrl: string,
  ghAccessToken: string | null,
  selectedId: string | null,
  repoInformation: GithubRepoInfo | null,
  onSuccess: (arg: ROS) => void,
  fetchFn: typeof fetch,
) => {
  if (selectedId && ghAccessToken && repoInformation) {
    fetchFn(uriToFetchRos(baseUrl, repoInformation, selectedId), {
      headers: githubGetRequestHeaders(ghAccessToken),
    })
      .then(res => res.json())
      .then(json => json as ROSContentResultDTO)
      .then(fetchedRos => {
        if (fetchedRos.rosContent !== null) {
          const rosContent = JSON.parse(fetchedRos.rosContent) as ROS;
          onSuccess(rosContent);
        } else
          console.log(`Kunne ikke hente ros med status: ${fetchedRos.status}`);
      });
  }
};

export const postROS = (
  newRos: ROS,
  baseUrl: string,
  repoInfo: GithubRepoInfo | null,
  ghAccessToken: string | null,
  onSuccess: (arg: ROSProcessResultDTO) => void,
  onError: (error: string) => void,
  fetchFn: typeof fetch,
) => {
  if (repoInfo && ghAccessToken) {
    fetchFn(`${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Github-Access-Token': ghAccessToken,
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
