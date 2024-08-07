import { useEntity } from '@backstage/plugin-catalog-react';
import { useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import {
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
} from './DTOs';
import { latestSupportedVersion } from './constants';

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

export const useAuthenticatedFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = `${riScUri}/all?latestSupportedVersion=${latestSupportedVersion}`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const [response, setResponse] = useResponse();

  const authenticatedFetch = <T>(
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
      fetch(uri, {
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
    authenticatedFetch<RiScContentResultDTO[]>(
      uriToFetchAllRiScs,
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

  const publishRiScs = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: PublishRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<PublishRiScResultDTO>(
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

  const postRiScs = (
    riSc: RiSc,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<ProcessRiScResultDTO>(
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

  const putRiScs = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<ProcessRiScResultDTO>(
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
    fetchRiScs,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
  };
};
