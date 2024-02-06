import { GithubRepoInfo, ROS } from '../interface/interfaces';
import {
  githubRequestHeaders,
  uriToFetchRos,
  uriToFetchRosIds,
} from './utilityfunctions';
import { ROSContentResultDTO, RosIdentifierResponseDTO } from './types';

export const fetchROSIds = (
  baseUrl: string,
  accessToken: string | undefined,
  repoInformation: GithubRepoInfo | null,
  onSuccess: (arg: RosIdentifierResponseDTO) => void,
) => {
  if (accessToken && repoInformation) {
    fetch(uriToFetchRosIds(baseUrl, repoInformation), {
      headers: githubRequestHeaders(accessToken),
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
  accessToken: string | undefined,
  selectedId: string | null,
  repoInformation: GithubRepoInfo | null,
  onSuccess: (arg: ROS) => void,
) => {
  if (selectedId && accessToken && repoInformation) {
    fetch(uriToFetchRos(baseUrl, repoInformation, selectedId), {
      headers: githubRequestHeaders(accessToken),
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
