import { useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useState, useEffect, useRef } from 'react';
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
  RiSc,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import {
  CreateRiScResultDTO,
  GcpCryptoKeyObject,
  OpenPullRequestForSopsConfigResponseBody,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
  SopsConfigCreateResponse,
  SopsConfigDTO,
  SopsConfigRequestBody,
  SopsConfigResultDTO,
  sopsConfigToDTOString,
  SopsConfigUpdateResponse,
} from './DTOs';
import { latestSupportedVersion } from './constants';
import { URLS } from '../urls';

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
  const riScUri = `${backendUrl}${URLS.backend.riScUri_temp}/${repoInformation.owner}/${repoInformation.name}`; // URLS.backend.riScUri
  const sopsUri = `${backendUrl}${URLS.backend.sopsUri_temp}/${repoInformation.owner}/${repoInformation.name}`; // URLS.backend.sopsUri
  function openPullRequestForSopsConfigUri(branch: string) {
    return `${sopsUri}/openPullRequest/${branch}`; // URLS.backend.open_pr
  }
  const uriToFetchAllRiScs = `${riScUri}/${latestSupportedVersion}/all`; // URLS.backend.fetchAllRiScs
  const uriToFetchDifference = (id: string) => `${riScUri}/${id}/difference`; // URLS.backend.fetchDifference
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`; // URLS.backend.fetchRiSc
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`; // URLS.backend.publishRiSc

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

  const configApi = useApi(configApiRef);
  const isDevelopment = () =>
    configApi.getString('auth.environment') === 'development';

  const fullyAuthenticatedFetch = <T, K>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: K, rejectedLogin: boolean) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        URLS.other.cloudkms,
        URLS.other.cloud_platform,
        URLS.other.cloudplatformprojects_readonly,
      ]),
      gitHubApi.getAccessToken(['repo']),
    ])
      .then(([idToken, googleAccessToken, gitHubAccessToken]) => {
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
              .then(typedJson => onError(typedJson, false))
              .catch(error => onError(error, false));
          }
          return res
            .json()
            .then(json => json as T)
            .then(typedJson => onSuccess(typedJson));
        });
      })
      .catch(error => {
        if (error.name === 'RejectedError') {
          onError(error, true);
        } else {
          onError(error, false);
        }
      });
  };

  const googleAuthenticatedFetch = <T, K>(
    uri: string,
    method: 'GET',
    onSuccess: (response: T) => void,
    onError: (error: K, rejectedLogin: boolean) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        URLS.other.cloudkms,
        URLS.other.cloud_platform,
        URLS.other.cloudplatformprojects_readonly,
      ]),
    ])
      .then(([idToken, googleAccessToken]) => {
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
              .then(typedJson => onError(typedJson, false))
              .catch(error => onError(error, false));
          }
          return res
            .json()
            .then(json => json as T)
            .then(typedJson => onSuccess(typedJson));
        });
      })
      .catch(error => {
        if (error.name === 'RejectedError') {
          onError(error, true);
        } else {
          onError(error, false);
        }
      });
  };

  const fetchDifference = (
    selectedRiSc: RiScWithMetadata,
    onSuccess: (response: DifferenceDTO) => void,
    onError?: (loginRejected: boolean) => void,
  ) =>
    identityApi.getProfileInfo().then(profile => {
      fullyAuthenticatedFetch<DifferenceDTO, DifferenceDTO>(
        uriToFetchDifference(selectedRiSc.id),
        'POST',
        onSuccess,
        (_, rejectedLogin) => {
          if (onError) onError(rejectedLogin);
        },
        riScToDTOString(
          selectedRiSc.content,
          false,
          profile,
          selectedRiSc.sopsConfig,
        ),
      );
    });

  const fetchRiScs = (
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: (loginRejected: boolean) => void,
  ) => {
    if (isDevelopment()) {
      fullyAuthenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
        uriToFetchAllRiScs,
        'GET',
        onSuccess,
        (_, rejectedLogin) => {
          if (onError) onError(rejectedLogin);
        },
      );
    } else {
      googleAuthenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
        uriToFetchAllRiScs,
        'GET',
        onSuccess,
        (_, rejectedLogin) => {
          if (onError) onError(rejectedLogin);
        },
      );
    }
  };

  const fetchSopsConfig = (
    onSuccess: (response: SopsConfigResultDTO) => void,
    onError?: (error: SopsConfigResultDTO, loginRejected: boolean) => void,
  ) => {
    if (isDevelopment()) {
      fullyAuthenticatedFetch<SopsConfigResultDTO, SopsConfigResultDTO>(
        sopsUri,
        'GET',
        res => onSuccess(res),
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
      );
    } else {
      googleAuthenticatedFetch<SopsConfigResultDTO, SopsConfigResultDTO>(
        sopsUri,
        'GET',
        res => onSuccess(res),
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
      );
    }
  };

  const fetchGcpCryptoKeys = (
    onSuccess: (response: GcpCryptoKeyObject[]) => void,
    onError?: (error: GcpCryptoKeyObject[], loginRejected: boolean) => void,
  ) => {
    fullyAuthenticatedFetch<GcpCryptoKeyObject[], GcpCryptoKeyObject[]>(
      `${backendUrl}/api/proxy/risc-proxy/api/google/gcpCryptoKeys`,
      'GET',
      res => onSuccess(res),
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
    );
  };

  const putSopsConfig = (
    sopsConfig: SopsConfigRequestBody,
    onSuccess: (response: SopsConfigCreateResponse) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) =>
    fullyAuthenticatedFetch<SopsConfigCreateResponse, SopsConfigCreateResponse>(
      sopsUri,
      'PUT',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
      sopsConfigToDTOString(sopsConfig),
    );

  const postSopsConfig = (
    sopsConfig: SopsConfigRequestBody,
    branch: string,
    onSuccess: (response: SopsConfigUpdateResponse) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) =>
    fullyAuthenticatedFetch<SopsConfigUpdateResponse, ProcessRiScResultDTO>(
      `${sopsUri}?ref=${branch}`,
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
      sopsConfigToDTOString(sopsConfig),
    );

  const postOpenPullRequestForSopsConfig = (
    branch: string,
    onSuccess: (response: OpenPullRequestForSopsConfigResponseBody) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
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
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
    );

  const publishRiScs = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fullyAuthenticatedFetch<PublishRiScResultDTO, ProcessRiScResultDTO>(
        uriToPublishRiSc(riScId),
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        profileInfoToDTOString(profile),
      ),
    );

  const postRiScs = (
    riSc: RiSc,
    generateDefault: boolean,
    sopsConfig: SopsConfigDTO,
    onSuccess?: (response: CreateRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fullyAuthenticatedFetch<CreateRiScResultDTO, ProcessRiScResultDTO>(
        `${riScUri}?generateDefault=${generateDefault}`,
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        riScToDTOString(riSc, true, profile, sopsConfig),
      ),
    );

  const putRiScs = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO | PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
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
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        riScToDTOString(
          riSc.content,
          riSc.isRequiresNewApproval!!,
          profile,
          riSc.sopsConfig,
        ),
      ),
    );
  };

  return {
    fetchRiScs,
    fetchSopsConfig,
    fetchGcpCryptoKeys,
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

export const useIsMounted = () => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
};
