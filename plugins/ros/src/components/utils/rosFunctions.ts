import { GithubRepoInfo, ROS } from '../interface/interfaces';
import { githubPostRequestHeaders } from './utilityfunctions';
import {
  ROSContentResultDTO,
  RosIdentifier,
  RosIdentifierResponseDTO,
  ROSProcessingStatus,
  ROSProcessResultDTO,
} from './types';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useState } from 'react';

export interface SubmitResponseObject {
  statusMessage: string;
  status: ROSProcessingStatus;
}

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

export const useFetch = (
  accessToken: string | undefined,
  repoInformation: GithubRepoInfo | null,
) => {
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const baseUri = useApi(configApiRef).getString('app.backendUrl');
  const rosUri = `${baseUri}/api/ros/${repoInformation?.owner}/${repoInformation?.name}`;
  const uriToFetchRosIds = () => `${rosUri}/ids`;
  const uriToFetchRos = (id: string) => `${rosUri}/${id}`;
  const uriToPublishROS = (id: string) => `${rosUri}/publish/${id}`;

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
