import { useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  DifferenceDTO,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import {
  CreateRiScResultDTO,
  OpenPullRequestForSopsConfigResponseBody,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
  SopsConfigCreateResponse,
  SopsConfigRequestBody,
  SopsConfigResultDTO,
  sopsConfigToDTOString,
  SopsConfigUpdateResponse,
} from './DTOs';
import { latestSupportedVersion } from './constants';
import { pluginRiScTranslationRef } from './translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const useGithubRepositoryInformation = (): GithubRepoInfo => {
  const [, org, repo] =
    useEntity().entity.metadata.annotations?.['backstage.io/view-url'].match(
      /github\.com\/([^\/]+)\/([^\/]+)/,
    ) || [];

  return {
    owner: org,
    name: repo,
  };
};

export const useAuthenticatedFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const gitHubApi = useApi(githubAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const sopsUri = `${backendUrl}/api/proxy/risc-proxy/api/sops/${repoInformation.owner}/${repoInformation.name}`;
  const openPullRequestForSopsConfigUri = (branch: string) =>
    `${sopsUri}/openPullRequest/${branch}`;
  const uriToFetchAllRiScs = `${riScUri}/${latestSupportedVersion}/all`;
  const uriToFetchDifference = (id: string) => `${riScUri}/${id}/difference`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const useResponse = (): [
    SubmitResponseObject | null,
    (submitStatus: SubmitResponseObject | null) => void,
  ] => {
    const [submitResponse, setSubmitResponse] =
      useState<SubmitResponseObject | null>(null);

    // use callback to avoid infinite loop
    const displaySubmitResponse = useCallback(
      (submitStatus: SubmitResponseObject | null) => {
        setSubmitResponse(submitStatus);
        setTimeout(() => {
          setSubmitResponse(null);
        }, 10000);
      },
      [],
    );

    return [submitResponse, displaySubmitResponse];
  };

  const [response, setResponse] = useResponse();

  const fullyAuthenticatedFetch = <T, K>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: K) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        'https://www.googleapis.com/auth/cloudkms',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudplatformprojects.readonly',
      ]),
      gitHubApi.getAccessToken(['repo']),
    ]).then(([idToken, googleAccessToken, gitHubAccessToken]) => {
      fetch(uri, {
        method: method,
        headers: {
          Authorization: `Bearer ${idToken.token}`,
          'GCP-Access-Token': googleAccessToken,
          'GitHub-Access-Token': gitHubAccessToken,
          'Content-Type': 'application/json',
        },
        body: body,
      }).then(res => {
        if (!res.ok) {
          return res
            .json()
            .then(json => json as K)
            .then(typedJson => onError(typedJson))
            .catch(error => onError(error));
        }
        return res
          .json()
          .then(json => json as T)
          .then(typedJson => onSuccess(typedJson));
      });
    });
  };

  const googleAuthenticatedFetch = <T, K>(
      uri: string,
      method: 'GET' | 'POST' | 'PUT',
      onSuccess: (response: T) => void,
      onError: (error: K) => void,
      body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        'https://www.googleapis.com/auth/cloudkms',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudplatformprojects.readonly',
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
      }).then(res => {
        if (!res.ok) {
          return res
              .json()
              .then(json => json as K)
              .then(typedJson => onError(typedJson))
              .catch(error => onError(error));
        }
        return res
            .json()
            .then(json => json as T)
            .then(typedJson => onSuccess(typedJson));
      });
    });
  };

  const fetchDifference = (
    selectedRiSc: RiScWithMetadata,
    onSuccess: (response: DifferenceDTO) => void,
    onError?: () => void,
  ) =>
    identityApi.getProfileInfo().then(profile => {
      fullyAuthenticatedFetch<DifferenceDTO, DifferenceDTO>(
        uriToFetchDifference(selectedRiSc.id),
        'POST',
        onSuccess,
        () => {
          if (onError) onError();
        },
        riScToDTOString(selectedRiSc.content, false, profile),
      );
    });

  const fetchRiScs = (
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: () => void,
  ) =>
    googleAuthenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
      uriToFetchAllRiScs,
      'GET',
      onSuccess,
      () => {
        if (onError) onError();
        setResponse({
          statusMessage: t('errorMessages.FailedToFetchRiScs'),
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
        });
      },
    );

  const fetchSopsConfig = (
    onSuccess: (response: SopsConfigResultDTO) => void,
    onError?: (error: SopsConfigResultDTO) => void,
  ) =>
    googleAuthenticatedFetch<SopsConfigResultDTO, SopsConfigResultDTO>(
      sopsUri,
      'GET',
      res => onSuccess(res),
      error => {
        if (onError) onError(error);
      },
    );

  const putSopsConfig = (
    sopsConfig: SopsConfigRequestBody,
    onSuccess: (response: SopsConfigCreateResponse) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    fullyAuthenticatedFetch<SopsConfigCreateResponse, SopsConfigCreateResponse>(
      sopsUri,
      'PUT',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
      sopsConfigToDTOString(sopsConfig),
    );

  const postSopsConfig = (
    sopsConfig: SopsConfigRequestBody,
    branch: string,
    onSuccess: (response: SopsConfigUpdateResponse) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    fullyAuthenticatedFetch<SopsConfigUpdateResponse, ProcessRiScResultDTO>(
      `${sopsUri}?ref=${branch}`,
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
      sopsConfigToDTOString(sopsConfig),
    );

  const postOpenPullRequestForSopsConfig = (
    branch: string,
    onSuccess: (response: OpenPullRequestForSopsConfigResponseBody) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    fullyAuthenticatedFetch<
      OpenPullRequestForSopsConfigResponseBody,
      ProcessRiScResultDTO
    >(
      openPullRequestForSopsConfigUri(branch),
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        setResponse(error);
        if (onError) onError(error);
      },
    );

  const publishRiScs = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fullyAuthenticatedFetch<PublishRiScResultDTO, ProcessRiScResultDTO>(
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
    generateDefault: boolean,
    onSuccess?: (response: CreateRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fullyAuthenticatedFetch<CreateRiScResultDTO, ProcessRiScResultDTO>(
        `${riScUri}?generateDefault=${generateDefault}`,
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
    onSuccess?: (response: ProcessRiScResultDTO | PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      fullyAuthenticatedFetch<
        ProcessRiScResultDTO | PublishRiScResultDTO,
        ProcessRiScResultDTO
      >(
        uriToFetchRiSc(riSc.id),
        'PUT',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        riScToDTOString(riSc.content, riSc.isRequiresNewApproval!!, profile),
      ),
    );
  };

  return {
    fetchRiScs,
    fetchSopsConfig,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    fetchDifference,
    putSopsConfig,
    postSopsConfig,
    postOpenPullRequestForSopsConfig,
  };
};
