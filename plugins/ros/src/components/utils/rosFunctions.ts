import { GithubRepoInfo, ROS } from '../interface/interfaces';
import { githubPostRequestHeaders } from './utilityfunctions';
import {
  ROSContentResultDTO,
  RosIdentifier,
  RosIdentifierResponseDTO,
  ROSProcessResultDTO,
} from './types';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

export const useFetch = (
  accessToken: string | undefined,
  repoInformation: GithubRepoInfo | null,
): {
  fetchROSIds: (onSuccess: (arg: RosIdentifier[]) => void) => void;
  fetchROS: (rosId: string, onSuccess: (arg: ROS) => void) => void;
  postROS: (
    ros: ROS,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => void;
  putROS: (
    ros: ROS,
    rosId: string,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => void;
  publishROS: (
    rosId: string,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) => void;
} => {
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const baseUri = useApi(configApiRef).getString('app.backendUrl');
  const rosUri = `${baseUri}/api/ros/${repoInformation?.owner}/${repoInformation?.name}`;
  const uriToFetchRosIds = () => `${rosUri}/ids`;
  const uriToFetchRos = (id: string) => `${rosUri}/${id}`;
  const uriToPublishROS = (id: string) => `${rosUri}/publish/${id}`;

  const fetch = <T>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (arg: T) => void,
    onError: (error: string) => void,
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
      (error: string) => console.error('Kunne ikke hente ROS-ider:', error),
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
      (error: string) => console.error(error),
    );

  const postROS = (
    ros: ROS,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      rosUri,
      'POST',
      onSuccess,
      onError,
      JSON.stringify({ ros: JSON.stringify(ros) }),
    );

  const putROS = (
    ros: ROS,
    rosId: string,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      uriToFetchRos(rosId),
      'PUT',
      onSuccess,
      onError,
      JSON.stringify({ ros: JSON.stringify(ros) }),
    );

  const publishROS = (
    rosId: string,
    onSuccess: (arg: ROSProcessResultDTO) => void,
    onError: (error: string) => void,
  ) =>
    fetch<ROSProcessResultDTO>(
      uriToPublishROS(rosId),
      'POST',
      onSuccess,
      onError,
    );

  return { fetchROSIds, fetchROS, postROS, putROS, publishROS };
};
