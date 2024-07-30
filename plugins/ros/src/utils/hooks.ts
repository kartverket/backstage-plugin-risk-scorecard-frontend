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

export const useFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = () => `${riScUri}/all`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const uriToFetchLatestJSONSchema = () =>
    `${backendUrl}/api/proxy/risc-proxy/api/risc/schemas/latest`;

  const [response, setResponse] = useResponse();

  const fetch = <T>(
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
      fetchApi(uri, {
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
    fetch<RiScContentResultDTO[]>(
      uriToFetchAllRiScs(),
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

  const fetchLatestJSONSchema = (
    onSuccess: (response: string) => void,
    onError?: () => void,
  ) =>
    fetch<string>(uriToFetchLatestJSONSchema(), 'GET', onSuccess, () => {
      if (onError) onError();
      setResponse({
        statusMessage:
          'Failed to fetch JSON schema. Fallback value 3.3 for schema version used',
        status: ProcessingStatus.ErrorWhenFetchingJSONSchema,
      });
    });

  const publishRiSc = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: PublishRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<PublishRiScResultDTO>(
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

  const postRiSc = (
    riSc: RiSc,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
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

  const putRiSc = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
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
    fetchRiScs: fetchRiScs,
    postRiScs: postRiSc,
    putRiScs: putRiSc,
    publishRiScs: publishRiSc,
    response,
    setResponse,
    fetchLatestJSONSchema,
  };
};
