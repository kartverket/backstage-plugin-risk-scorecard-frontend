import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { URLS } from '../urls';
import {
  CreateRiScResultDTO,
  DeleteRiScResultDTO,
  GcpCryptoKeyObject,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
  SopsConfigDTO,
} from './DTOs';
import { latestSupportedVersion } from './constants';
import {
  DefaultRiScTypeDescriptor,
  DifferenceDTO,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScWithMetadata,
} from './types';

export function useGithubRepositoryInformation(): GithubRepoInfo {
  const [, org, repo] =
    useEntity().entity.metadata.annotations?.['backstage.io/view-url'].match(
      /github\.com\/([^\/]+)\/([^\/]+)/,
    ) || [];

  return {
    owner: org,
    name: repo,
  };
}

/**
 * Backstage has a bug where multiple tabs using the GitHub access token can each
 * fetch a new token and invalidate tokens cached in older tabs. To mitigate this
 * we patch an internal refresh predicate so a token verified as invalid can be
 * refreshed before retrying the request.
 */
let invalidGitHubAccessToken = '';
function patchGithubApiToEnableForcedRefresh<T>(
  gitHubApi: T,
  isDevelopment: boolean,
): T {
  const sessionManager = (gitHubApi as any)?.sessionManager;
  if (!sessionManager?.originalSessionShouldRefreshFunc) {
    if (typeof sessionManager?.sessionShouldRefreshFunc === 'function') {
      sessionManager.originalSessionShouldRefreshFunc =
        sessionManager.sessionShouldRefreshFunc;
      sessionManager.sessionShouldRefreshFunc =
        function sessionShouldRefreshFuncOverride(session: any) {
          const accessToken = session?.providerInfo?.accessToken;
          if (isDevelopment && invalidGitHubAccessToken && !accessToken) {
            throw new Error(
              'The expected location of the accessToken was empty. This workaround is no longer working',
            );
          }
          if (accessToken === invalidGitHubAccessToken) {
            invalidGitHubAccessToken = '';
            return true;
          }
          return sessionManager.originalSessionShouldRefreshFunc(session);
        };
    } else if (isDevelopment) {
      throw new Error(
        'The expected function "sessionShouldRefreshFunc" does not exist. This workaround is no longer working',
      );
    }
  }

  return gitHubApi;
}

export function useAuthenticatedFetch() {
  const configApi = useApi(configApiRef);
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const gitHubApi = patchGithubApiToEnableForcedRefresh(
    useApi(githubAuthApiRef),
    isDevelopment(),
  );
  const identityApi = useApi(identityApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendUrl = configApi.getString('backend.baseUrl');
  const riScUri = `${backendUrl}${URLS.backend.riScUri_temp}/${repoInformation.owner}/${repoInformation.name}`; // URLS.backend.riScUri

  const uriToFetchAllRiScs = `${riScUri}/${latestSupportedVersion}/all`; // URLS.backend.fetchAllRiScs
  const uriToFetchDefaultRiScDescriptors = `${backendUrl}${URLS.backend.fetchDefaultRiScTypeDescriptors}`;

  function uriToFetchDifference(id: string) {
    // URLS.backend.fetchDifference
    return `${riScUri}/${id}/difference`;
  }

  function uriToFetchRiSc(id: string) {
    // URLS.backend.fetchRiSc
    return `${riScUri}/${id}`;
  }

  function uriToDeleteRiSc(id: string) {
    // URLS.backend.deleteRiSc
    return `${riScUri}/${id}`;
  }

  function uriToPublishRiSc(id: string) {
    // URLS.backend.publishRiSc
    return `${riScUri}/publish/${id}`;
  }

  function isDevelopment() {
    return configApi.getString('auth.environment') === 'development';
  }

  async function fullyAuthenticatedFetch<T, K>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    onSuccess: (response: T) => void,
    onError: (error: K, rejectedLogin: boolean) => void,
    body?: string,
  ) {
    try {
      const [idToken, googleAccessToken, gitHubAccessToken] = await Promise.all(
        [
          identityApi.getCredentials(),
          googleApi.getAccessToken([
            URLS.external.www_googleapis_com__cloudkms,
            URLS.external.www_googleapis_com__cloud_platform,
            URLS.external.www_googleapis_com__cloudplatformprojects_readonly,
          ]),
          gitHubApi.getAccessToken(['repo']),
        ],
      );
      const headers = {
        Authorization: `Bearer ${idToken.token}`,
        'GCP-Access-Token': googleAccessToken,
        'GitHub-Access-Token': gitHubAccessToken,
        'Content-Type': 'application/json',
      };
      let res = await fetch(uri, {
        method: method,
        headers,
        body: body,
      });

      let json = await res.json();

      if (
        res.status === 401 &&
        (json as ProcessRiScResultDTO)?.status ===
          ProcessingStatus.InvalidGitHubAccessToken
      ) {
        invalidGitHubAccessToken = headers['GitHub-Access-Token'];
        headers['GitHub-Access-Token'] = await gitHubApi.getAccessToken([
          'repo',
        ]);
        res = await fetch(uri, {
          method: method,
          headers: headers,
          body: body,
        });
        json = await res.json();
      }

      if (!res.ok) {
        return onError(json as K, false);
      }

      return onSuccess(json as T);
    } catch (error: any) {
      if (error.name === 'RejectedError') {
        onError(error, true);
      } else {
        onError(error, false);
      }
      return Promise.resolve(null);
    }
  }

  function googleAuthenticatedFetch<T, K>(
    uri: string,
    method: 'GET',
    onSuccess: (response: T) => void,
    onError: (error: K, rejectedLogin: boolean) => void,
    body?: string,
  ) {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        URLS.external.www_googleapis_com__cloudkms,
        URLS.external.www_googleapis_com__cloud_platform,
        URLS.external.www_googleapis_com__cloudplatformprojects_readonly,
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
        }).then((res) => {
          if (!res.ok) {
            return res
              .json()
              .then((json) => json as K)
              .then((typedJson) => onError(typedJson, false))
              .catch((error) => onError(error, false));
          }
          return res
            .json()
            .then((json) => json as T)
            .then((typedJson) => onSuccess(typedJson));
        });
      })
      .catch((error) => {
        if (error.name === 'RejectedError') {
          onError(error, true);
        } else {
          onError(error, false);
        }
      });
  }

  function fetchDifference(
    selectedRiSc: RiScWithMetadata,
    onSuccess: (response: DifferenceDTO) => void,
    onError?: (loginRejected: boolean) => void,
  ) {
    return identityApi.getProfileInfo().then((profile) => {
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
  }

  function fetchRiScs(
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: (error: any, loginRejected: boolean) => void,
  ) {
    if (isDevelopment()) {
      fullyAuthenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
        uriToFetchAllRiScs,
        'GET',
        onSuccess,
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
      );
    } else {
      googleAuthenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
        uriToFetchAllRiScs,
        'GET',
        onSuccess,
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
      );
    }
  }

  function postFeedback(feedback: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fullyAuthenticatedFetch<void, any>(
        `${riScUri}/feedback`,
        'POST',
        () => resolve(),
        (error) => reject(error),
        feedback,
      );
    });
  }

  function fetchGcpCryptoKeys(
    onSuccess: (response: GcpCryptoKeyObject[]) => void,
    onError?: (error: GcpCryptoKeyObject[], loginRejected: boolean) => void,
  ) {
    googleAuthenticatedFetch<GcpCryptoKeyObject[], GcpCryptoKeyObject[]>(
      `${backendUrl}/api/proxy/risc-proxy/api/google/gcpCryptoKeys`, // URL
      'GET',
      (res) => onSuccess(res),
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
    );
  }

  function publishRiScs(
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) {
    return identityApi.getProfileInfo().then((profile) =>
      fullyAuthenticatedFetch<PublishRiScResultDTO, ProcessRiScResultDTO>(
        uriToPublishRiSc(riScId),
        'POST',
        (res) => {
          if (onSuccess) onSuccess(res);
        },
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        profileInfoToDTOString(profile),
      ),
    );
  }

  function postRiScs(
    riSc: RiSc,
    generateDefault: boolean,
    sopsConfig: SopsConfigDTO,
    defaultRiScId: string | undefined,
    onSuccess?: (response: CreateRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) {
    return identityApi.getProfileInfo().then((profile) =>
      fullyAuthenticatedFetch<CreateRiScResultDTO, ProcessRiScResultDTO>(
        `${riScUri}?generateDefault=${generateDefault}`,
        'POST',
        (res) => {
          if (onSuccess) onSuccess(res);
        },
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        riScToDTOString(riSc, true, profile, sopsConfig, defaultRiScId),
      ),
    );
  }

  function putRiScs(
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO | PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) {
    return identityApi.getProfileInfo().then((profile) =>
      fullyAuthenticatedFetch<
        ProcessRiScResultDTO | PublishRiScResultDTO,
        ProcessRiScResultDTO
      >(
        uriToFetchRiSc(riSc.id),
        'PUT',
        (res) => {
          if (onSuccess) onSuccess(res);
        },
        (error, rejectedLogin) => {
          if (onError) onError(error, rejectedLogin);
        },
        riScToDTOString(
          riSc.content,
          riSc.isRequiresNewApproval!,
          profile,
          riSc.sopsConfig,
        ),
      ),
    );
  }

  function deleteRiScs(
    riScId: string,
    onSuccess?: (response: DeleteRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO, loginRejected: boolean) => void,
  ) {
    fullyAuthenticatedFetch<DeleteRiScResultDTO, ProcessRiScResultDTO>(
      uriToDeleteRiSc(riScId),
      'DELETE',
      (res) => {
        if (onSuccess) onSuccess(res);
      },
      (error, rejectedLogin) => {
        if (onError) onError(error, rejectedLogin);
      },
    );
  }

  function fetchDefaultRiScTypeDescriptors(
    onSuccess: (response: DefaultRiScTypeDescriptor[]) => void,
  ) {
    fullyAuthenticatedFetch<DefaultRiScTypeDescriptor[], void>(
      uriToFetchDefaultRiScDescriptors,
      'GET',
      (res) => onSuccess(res),
      () => {},
    );
  }
  return {
    fetchRiScs,
    fetchGcpCryptoKeys,
    postRiScs,
    putRiScs,
    deleteRiScs,
    publishRiScs,
    fetchDifference,
    postFeedback,
    fetchDefaultRiScTypeDescriptors,
  };
}

export const useDebouncedValue = <T>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

export function useDebounce<T>(
  value: T,
  delay: number,
  callback: (value: T) => void,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestValueRef = useRef<T>(value);
  const latestCallbackRef = useRef<(v: T) => void>(callback);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    latestCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      latestCallbackRef.current(latestValueRef.current);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const v = latestValueRef.current;
    const hasValue = Array.isArray(v) ? v.length > 0 : v !== null;
    if (hasValue) {
      latestCallbackRef.current(v);
    }
  }, []);
  return { flush };
}
