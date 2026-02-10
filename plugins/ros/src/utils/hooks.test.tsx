import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { SopsConfigDTO } from './DTOs';
import { useAuthenticatedFetch, useGithubRepositoryInformation } from './hooks';
import { Action, RiSc, RiScWithMetadata, Scenario } from './types';

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
  const mockGithubApi = { getAccessToken: jest.fn() };
  const mockIdentityApi = {
    getCredentials: jest.fn(),
    getProfileInfo: jest.fn(),
  };
  const mockFetchApi = {
    fetch: jest.fn(),
  };

  const mockConfigApi = {
    getString: jest.fn().mockImplementation(key => {
      if (key === 'backend.baseUrl') return 'http://localhost:7000';
      if (key === 'auth.environment') return 'development';
      return '';
    }),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [googleAuthApiRef, mockGoogleApi],
        [githubAuthApiRef, mockGithubApi],
        [identityApiRef, mockIdentityApi],
        [fetchApiRef, mockFetchApi],
        [configApiRef, mockConfigApi],
      ]}
    >
      {children}
    </TestApiProvider>
  );

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
        metadata: { belongsTo: '' },
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
        metadata: { belongsTo: '' },
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
        metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
          metadata: { belongsTo: '' },
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
});
