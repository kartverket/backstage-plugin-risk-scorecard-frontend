// prettier-ignore

// (1) Requires a method to inject tokens. Not yet implemented.
// (2) Temporary primitive url until method (1) is implemented.

export const BACKEND_URLS = {
	google_gcpCryptoKeys: '/api/proxy/risc-proxy/api/google/gcpCryptoKeys',
	riScUri: '/api/proxy/risc-proxy/api/risc/:repoOwner/:repoName', // (1)
	riScUri_temp: '/api/proxy/risc-proxy/api/risc', // (2)
	open_pr: '/api/proxy/risc-proxy/api/sops/:repoOwner/:repoName/openPullRequest/:branch', // (1)
	fetchAllRiScs: '/api/proxy/risc-proxy/api/risc/:repoOwner/:repoName/:version/all', // (1)
	fetchDifference: '/api/proxy/risc-proxy/api/risc/:repoOwner/:repoName/:id/difference', // (1)
	fetchRiSc: '/api/proxy/risc-proxy/api/risc/:repoOwner/:repoName/:id', // (1)
  deleteRiSc: 'api/proxy/risc-proxy/api/risc/:repoOwner/:repoName/:id', // (1)
	publishRiSc: '/api/proxy/risc-proxy/api/risc/:repoOwner/:repoName/publish/:id', // (1)
  fetchDefaultRiScTypeDescriptors: '/api/proxy/risc-proxy/api/initrisc'
};

export type RiScBackendUrls = {
  riScUri: string;
  uriToFetchAllRiScs: string;
  uriToFetchDifference: (id: string) => string;
  uriToFetchRiSc: (id: string) => string;
  uriToDeleteRiSc: (id: string) => string;
  uriToPublishRiSc: (id: string) => string;
  uriToFetchGcpCryptoKeys: string;
  uriToFetchDefaultRiScDescriptors: string;
};

type BuildRiScBackendUrlsOptions = {
  baseUrl: string;
  owner: string;
  repo: string;
  version: string;
};

/** Native mode routes directly to the ros backend plugin. */
export function buildNativeBackendUrls({
  baseUrl,
  owner,
  repo,
  version,
}: BuildRiScBackendUrlsOptions): RiScBackendUrls {
  const riScUri = `${baseUrl}/risc/${owner}/${repo}`;

  return {
    riScUri,
    uriToFetchAllRiScs: `${riScUri}/${version}/all`,
    uriToFetchDifference: (id: string) => `${riScUri}/${id}/difference`,
    uriToFetchRiSc: (id: string) => `${riScUri}/${id}`,
    uriToDeleteRiSc: (id: string) => `${riScUri}/${id}`,
    uriToPublishRiSc: (id: string) => `${riScUri}/publish/${id}`,
    uriToFetchGcpCryptoKeys: `${baseUrl}/google/gcpCryptoKeys`,
    uriToFetchDefaultRiScDescriptors: `${baseUrl}/initrisc`,
  };
}
