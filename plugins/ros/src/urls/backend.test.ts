import { buildNativeBackendUrls } from './backend';

describe('backend URLs', () => {
  const options = {
    baseUrl: 'http://localhost:7000',
    owner: 'org',
    repo: 'repo',
    version: '5.4',
  };

  it('builds native backend URLs from the known ros plugin base URL', () => {
    const urls = buildNativeBackendUrls({
      ...options,
      baseUrl: 'http://localhost:7000/api/ros',
    });

    expect(urls.riScUri).toBe('http://localhost:7000/api/ros/risc/org/repo');
    expect(urls.uriToFetchAllRiScs).toBe(
      'http://localhost:7000/api/ros/risc/org/repo/5.4/all',
    );
    expect(urls.uriToFetchDifference('risc-1')).toBe(
      'http://localhost:7000/api/ros/risc/org/repo/risc-1/difference',
    );
    expect(urls.uriToFetchRiSc('risc-1')).toBe(
      'http://localhost:7000/api/ros/risc/org/repo/risc-1',
    );
    expect(urls.uriToDeleteRiSc('risc-1')).toBe(
      'http://localhost:7000/api/ros/risc/org/repo/risc-1',
    );
    expect(urls.uriToPublishRiSc('risc-1')).toBe(
      'http://localhost:7000/api/ros/risc/org/repo/publish/risc-1',
    );
    expect(urls.uriToFetchGcpCryptoKeys).toBe(
      'http://localhost:7000/api/ros/google/gcpCryptoKeys',
    );
    expect(urls.uriToFetchDefaultRiScDescriptors).toBe(
      'http://localhost:7000/api/ros/initrisc',
    );
  });
});
