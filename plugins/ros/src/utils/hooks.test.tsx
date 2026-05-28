import {
  configApiRef,
  discoveryApiRef,
  featureFlagsApiRef,
  fetchApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { SopsConfigDTO } from './DTOs';
import {
  useAuthenticatedFetch,
  useGithubRepositoryInformation,
  useSystemRiScsForCurrentEntity,
} from './hooks';
import { Action, RiSc, RiScWithMetadata, Scenario } from './types';
import { nativeRiScBackendFeatureFlag } from './featureFlags';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

const MOCK_ID_TOKEN = '<fake-id-token>';
const MOCK_GCP_TOKEN = '<fake-google-token>';
const MOCK_GITHUB_TOKEN = '<fake-github-token>';

describe('useGithubRepositoryInformation', () => {
  it('extracts the org and repo from annotations', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          annotations: {
            'backstage.io/view-url': 'https://github.com/org/repo',
          },
        },
      },
    });

    const { result } = renderHook(() => useGithubRepositoryInformation());

    expect(result.current).toEqual({
      owner: 'org',
      name: 'repo',
    });
  });
});

describe('useAuthenticatedFetch', () => {
  const mockGoogleApi = { getAccessToken: jest.fn() };
  const mockGithubSessionShouldRefreshFunc = jest.fn(_ => false);
  const mockGithubApi = {
    getAccessToken: jest.fn(),
    sessionManager: {
      currentSession: {
        providerInfo: {
          accessToken: MOCK_GITHUB_TOKEN,
        },
      },
      sessionShouldRefreshFunc: mockGithubSessionShouldRefreshFunc,
    },
  };
  const mockIdentityApi = {
    getCredentials: jest.fn(),
    getProfileInfo: jest.fn(),
  };
  const mockFetchApi = {
    fetch: jest.fn(),
  };
  const mockFeatureFlagsApi = {
    isActive: jest.fn().mockReturnValue(false),
  };

  const mockConfigApi = {
    getString: jest.fn().mockImplementation(key => {
      if (key === 'backend.baseUrl') return 'http://localhost:7000';
      if (key === 'auth.environment') return 'development';
      return '';
    }),
    getOptionalString: jest.fn().mockReturnValue(undefined),
  };

  const mockDiscoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api/ros'),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [googleAuthApiRef, mockGoogleApi],
        [githubAuthApiRef, mockGithubApi],
        [identityApiRef, mockIdentityApi],
        [fetchApiRef, mockFetchApi],
        [configApiRef, mockConfigApi],
        [featureFlagsApiRef, mockFeatureFlagsApi],
        [discoveryApiRef, mockDiscoveryApi],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    mockFeatureFlagsApi.isActive.mockReturnValue(false);
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        metadata: {
          annotations: {
            'backstage.io/view-url': 'https://github.com/org/repo',
          },
        },
      },
    });
  });

  describe('uriToFetchRiSc', () => {
    it('calls fetch with bearer token and GCP access token', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => [{ ID: '1' }],
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();

      await act(async () => {
        result.current.fetchRiScs(onSuccess);
      });

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/all'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_ID_TOKEN}`,
            'GCP-Access-Token': MOCK_GCP_TOKEN,
          }),
        }),
      );

      expect(onSuccess).toHaveBeenCalledWith([{ ID: '1' }]);
    });

    it('uses native backend URLs when the hidden native backend flag is enabled', async () => {
      mockFeatureFlagsApi.isActive.mockImplementation(
        flag => flag === nativeRiScBackendFeatureFlag,
      );
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => [{ ID: '1' }],
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isReady).toBe(true));

      const onSuccess = jest.fn();

      await act(async () => {
        result.current.fetchRiScs(onSuccess);
      });

      expect(mockFeatureFlagsApi.isActive).toHaveBeenCalledWith(
        nativeRiScBackendFeatureFlag,
      );
      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('ros');
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/ros/risc/org/repo/5.4/all',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_ID_TOKEN}`,
            'GCP-Access-Token': MOCK_GCP_TOKEN,
          }),
        }),
      );
      expect(onSuccess).toHaveBeenCalledWith([{ ID: '1' }]);
    });

    it('onSuccess is not called and no error is thrown when fetch fails', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });

      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Not allowed' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });

      const onSuccess = jest.fn();
      await act(async () => {
        await result.current.fetchRiScs(onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('onSuccess is not called and no error is thrown when google API getAccessTokens fails', async () => {
      mockGoogleApi.getAccessToken.mockRejectedValue(new Error('No token'));
      const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.fetchRiScs(onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('onSuccess is not called and no error is thrown when github API getAccessTokens fails', async () => {
      mockGithubApi.getAccessToken.mockRejectedValue(new Error('No token'));
      const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.fetchRiScs(onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('postRiScs', () => {
    it('calls fetch with correct headers', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const sopsConfig = {} as unknown as SopsConfigDTO;
      const riSc = {
        ID: '1',
        scenarios: [
          {
            ID: '1',
            name: 'test',
            actions: [{ ID: '1' } as Partial<Action>],
          } as Partial<Scenario>,
        ],
      } as Partial<RiSc> as RiSc;

      await act(async () => {
        await result.current.postRiScs(
          riSc,
          false,
          sopsConfig,
          undefined,
          onSuccess,
          onError,
        );
      });

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/all'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_ID_TOKEN}`,
            'GCP-Access-Token': MOCK_GCP_TOKEN,
            'GitHub-Access-Token': MOCK_GITHUB_TOKEN,
          }),
        }),
      );

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/risc/org/repo'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_ID_TOKEN}`,
            'GCP-Access-Token': MOCK_GCP_TOKEN,
            'GitHub-Access-Token': MOCK_GITHUB_TOKEN,
          }),
        }),
      );
    });

    it('calls fetch with correct body', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const sopsConfig = {} as unknown as SopsConfigDTO;
      const riSc = {
        ID: '1',
        scenarios: [
          {
            ID: '1',
            name: 'test',
            actions: [{ ID: '1' } as Partial<Action>],
          } as Partial<Scenario>,
        ],
      } as Partial<RiSc> as RiSc;

      await act(async () => {
        await result.current.postRiScs(
          riSc,
          false,
          sopsConfig,
          undefined,
          onSuccess,
          onError,
        );
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'POST',
      );

      const [, postOptions] = postCall!;
      const parsedBody = JSON.parse(postOptions.body);

      expect(parsedBody.riSc).toContain('"ID":"1"'); // or parse again if you want to deeply inspect
      expect(parsedBody.userInfo).toEqual({ name: 'name', email: 'email' });

      expect(onSuccess).toHaveBeenCalledWith({ ID: '1' });
      expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError on fetch failure', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const sopsConfig = {} as unknown as SopsConfigDTO;
      const riSc = {
        ID: '1',
        scenarios: [
          {
            ID: '1',
            name: 'test',
            actions: [{ ID: '1' } as Partial<Action>],
          } as Partial<Scenario>,
        ],
      } as Partial<RiSc> as RiSc;

      await act(async () => {
        await result.current.postRiScs(
          riSc,
          false,
          sopsConfig,
          undefined,
          onSuccess,
          onError,
        );
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error',
        }),
        false,
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('retries once with a forced GitHub auth refresh when a write returns an access-token validation failure', async () => {
      const githubAccessTokenCallCount =
        mockGithubApi.getAccessToken.mock.calls.length;
      const fetchCallCount = mockFetchApi.fetch.mock.calls.length;
      mockGithubSessionShouldRefreshFunc.mockClear();
      mockGithubApi.sessionManager.currentSession = {
        providerInfo: {
          accessToken: MOCK_GITHUB_TOKEN,
        },
      };

      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockImplementation(async () => {
        const session = mockGithubApi.sessionManager.currentSession;
        if (mockGithubApi.sessionManager.sessionShouldRefreshFunc(session)) {
          mockGithubApi.sessionManager.currentSession = {
            providerInfo: {
              accessToken: '<fresh-github-token>',
            },
          };
        }
        return mockGithubApi.sessionManager.currentSession.providerInfo
          .accessToken;
      });
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ status: 'InvalidGitHubAccessToken' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ID: '1' }),
        });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        id: '1',
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.putRiScs(riScWithMetaData, onSuccess, onError);
      });

      const githubAccessTokenCalls =
        mockGithubApi.getAccessToken.mock.calls.slice(
          githubAccessTokenCallCount,
        );
      expect(githubAccessTokenCalls).toEqual([[['repo']], [['repo']]]);
      expect(mockGithubSessionShouldRefreshFunc).toHaveBeenCalledTimes(1);

      const fetchCalls = mockFetchApi.fetch.mock.calls.slice(fetchCallCount);
      expect(fetchCalls).toHaveLength(2);

      const [, retryOptions] = fetchCalls[1];
      expect(retryOptions.headers).toEqual(
        expect.objectContaining({
          'GitHub-Access-Token': '<fresh-github-token>',
        }),
      );
      expect(onSuccess).toHaveBeenCalledWith({ ID: '1' });
      expect(onError).not.toHaveBeenCalled();
      mockFetchApi.fetch.mock.calls.splice(fetchCallCount);
    });
  });

  describe('putRiSc', () => {
    it('calls fetch with correct data', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.putRiScs(riScWithMetaData, onSuccess, onError);
      });

      const putCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'PUT',
      );

      expect(putCall).toBeDefined();

      const [, putOptions] = putCall!;
      const parsedBody = JSON.parse(putOptions.body);

      expect(parsedBody.riSc).toContain('"ID":"1"');
      expect(parsedBody.userInfo).toEqual({ name: 'name', email: 'email' });

      expect(onSuccess).toHaveBeenCalledWith({ ID: '1' });
      expect(onError).not.toHaveBeenCalled();
    });

    it('calls fetch with correct headers', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.putRiScs(riScWithMetaData, onSuccess, onError);
      });

      const putCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'PUT',
      );

      expect(putCall).toBeDefined();

      const [, putOptions] = putCall!;
      expect(putOptions.headers).toEqual(
        expect.objectContaining({
          Authorization: `Bearer ${MOCK_ID_TOKEN}`,
          'GCP-Access-Token': MOCK_GCP_TOKEN,
          'GitHub-Access-Token': MOCK_GITHUB_TOKEN,
        }),
      );
    });

    it('calls onError on fetch failure', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.putRiScs(riScWithMetaData, onSuccess, onError);
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error',
        }),
        false,
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('publishRiScs', () => {
    it('calls fetch with correct headers', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.publishRiScs('1', onSuccess, onError);
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'POST',
      );

      expect(postCall).toBeDefined();

      const [, postOptions] = postCall!;
      expect(postOptions.headers).toEqual(
        expect.objectContaining({
          Authorization: `Bearer ${MOCK_ID_TOKEN}`,
          'GCP-Access-Token': MOCK_GCP_TOKEN,
          'GitHub-Access-Token': MOCK_GITHUB_TOKEN,
        }),
      );
    });

    it('calls fetch with correct body', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.publishRiScs('1', onSuccess, onError);
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'POST',
      );

      expect(postCall).toBeDefined();

      const [, postOptions] = postCall!;
      const parsedBody = JSON.parse(postOptions.body);

      expect(parsedBody.riSc).toContain('"ID":"1"');
      expect(parsedBody.userInfo).toEqual({ name: 'name', email: 'email' });

      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('onError is called on fetch failure', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.publishRiScs('1', onSuccess, onError);
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error',
        }),
        false,
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('fetchDifference', () => {
    it('calls fetch with correct headers', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.fetchDifference(
          riScWithMetaData,
          onSuccess,
          onError,
        );
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'POST',
      );

      expect(postCall).toBeDefined();

      const [, postOptions] = postCall!;
      expect(postOptions.headers).toEqual(
        expect.objectContaining({
          Authorization: `Bearer ${MOCK_ID_TOKEN}`,
          'GCP-Access-Token': MOCK_GCP_TOKEN,
          'GitHub-Access-Token': MOCK_GITHUB_TOKEN,
        }),
      );
    });

    it('calls fetch with correct body', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.fetchDifference(
          riScWithMetaData,
          onSuccess,
          onError,
        );
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/risc/org/repo') &&
          options?.method === 'POST',
      );

      expect(postCall).toBeDefined();

      const [, postOptions] = postCall!;
      const parsedBody = JSON.parse(postOptions.body);

      expect(parsedBody.riSc).toContain('"ID":"1"');
      expect(parsedBody.userInfo).toEqual({ name: 'name', email: 'email' });

      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('onError is called on fetch failure', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      const riScWithMetaData = {
        content: {
          ID: '1',
          scenarios: [
            {
              ID: '1',
              name: 'test',
              actions: [{ ID: '1' } as Partial<Action>],
            } as Partial<Scenario>,
          ],
        } as Partial<RiSc> as RiSc,
      } as Partial<RiScWithMetadata> as RiScWithMetadata;

      await act(async () => {
        await result.current.fetchDifference(
          riScWithMetaData,
          onSuccess,
          onError,
        );
      });

      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('fetchGcpCryptoKeys', () => {
    it('calls fetch with correct headers', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ projectID: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.fetchGcpCryptoKeys(onSuccess, onError);
      });

      const postCall = mockFetchApi.fetch.mock.calls.find(
        ([url, options]) =>
          typeof url === 'string' &&
          url.includes('/google/gcpCryptoKeys') &&
          options?.method === 'GET',
      );

      expect(postCall).toBeDefined();

      const [, postOptions] = postCall!;
      expect(postOptions.headers).toEqual(
        expect.objectContaining({
          Authorization: `Bearer ${MOCK_ID_TOKEN}`,
          'Content-Type': 'application/json',
          'GCP-Access-Token': MOCK_GCP_TOKEN,
        }),
      );
    });

    it('onSuccess is called with GcpKryptoKeys', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ projectId: '1' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.fetchGcpCryptoKeys(onSuccess, onError);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: '1',
        }),
      );
      expect(onError).not.toHaveBeenCalled();
    });

    it('onError is called on fetch failure', async () => {
      mockGoogleApi.getAccessToken.mockResolvedValue(MOCK_GCP_TOKEN);
      mockGithubApi.getAccessToken.mockResolvedValue(MOCK_GITHUB_TOKEN);
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockIdentityApi.getProfileInfo.mockResolvedValue({
        email: 'email',
        displayName: 'name',
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      const { result } = renderHook(() => useAuthenticatedFetch(), {
        wrapper,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await act(async () => {
        await result.current.fetchGcpCryptoKeys(onSuccess, onError);
      });

      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('useSystemRiScsForCurrentEntity', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockConfigApi.getString.mockImplementation(key => {
        if (key === 'backend.baseUrl') return 'http://localhost:7000';
        if (key === 'auth.environment') return 'development';
        return '';
      });
      mockIdentityApi.getCredentials.mockResolvedValue({
        token: MOCK_ID_TOKEN,
      });
      mockFeatureFlagsApi.isActive.mockReturnValue(true);
      (useEntity as jest.Mock).mockReturnValue({
        entity: {
          kind: 'Component',
          metadata: {
            name: 'kv-ros-test-6',
            namespace: 'default',
          },
        },
      });
    });

    it('fetches system RiScs for the current entity ref', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            sourceFilePath:
              'https://github.com/org/repo-6/.security/risc/risc-1.risc.yaml',
            riScId: 'risc-1',
            appliesTo: ['component:default/kv-ros-test-6'],
            lastSavedAt: '2026-05-02T08:30:00Z',
          },
          {
            sourceFilePath:
              'https://github.com/org/repo-4/.security/risc/risc-7ssVK.risc.yaml',
            riScId: 'risc-7ssVK',
            appliesTo: [
              'component:default/kv-ros-test-4',
              'component:default/kv-ros-test-6',
            ],
            lastSavedAt: '2026-05-01T08:30:00Z',
          },
        ],
      });

      const { result } = renderHook(() => useSystemRiScsForCurrentEntity(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/risk-scorecard/riscs?entityRef=component%3Adefault%2Fkv-ros-test-6',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_ID_TOKEN}`,
          }),
        }),
      );
      expect(result.current.riScs).toEqual([
        {
          sourceFilePath:
            'https://github.com/org/repo-4/.security/risc/risc-7ssVK.risc.yaml',
          riScId: 'risc-7ssVK',
          appliesTo: [
            'component:default/kv-ros-test-4',
            'component:default/kv-ros-test-6',
          ],
          lastSavedAt: '2026-05-01T08:30:00Z',
        },
      ]);
      expect(result.current.error).toBeUndefined();
    });

    it('does not fetch system RiScs when the feature flag is disabled', () => {
      mockFeatureFlagsApi.isActive.mockReturnValue(false);

      const { result } = renderHook(() => useSystemRiScsForCurrentEntity(), {
        wrapper,
      });

      expect(mockFeatureFlagsApi.isActive).toHaveBeenCalledWith('system-riscs');
      expect(result.current).toEqual({
        riScs: [],
        isFetching: false,
        error: undefined,
      });
      expect(mockIdentityApi.getCredentials).not.toHaveBeenCalled();
      expect(mockFetchApi.fetch).not.toHaveBeenCalled();
    });

    it('fetches system RiScs for non-component entities', async () => {
      (useEntity as jest.Mock).mockReturnValue({
        entity: {
          kind: 'System',
          metadata: {
            name: 'kv-ros-tests',
            namespace: 'default',
          },
        },
      });
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useSystemRiScsForCurrentEntity(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/api/risk-scorecard/riscs?entityRef=system%3Adefault%2Fkv-ros-tests',
        expect.anything(),
      );
    });
  });
});
