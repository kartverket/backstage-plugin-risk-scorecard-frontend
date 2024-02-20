import { GithubRepoInfo, ROS, TableData } from '../interface/interfaces';

export const mapToTableData = (data: ROS): TableData[] =>
  data.scenarier.map(scenario => ({
    beskrivelse: scenario.beskrivelse,
    trussel: scenario.trusselaktører.join(', '),
    sårbarhet: scenario.sårbarheter.join(', '),
    konsekvens: scenario.risiko.konsekvens,
    sannsynlighet: scenario.risiko.sannsynlighet,
    id: scenario.ID,
  }));

export const uriToFetchRosIds = (
  baseUrl: string,
  repoInformation: GithubRepoInfo,
) => `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/ids`;

export const uriToFetchRos = (
  baseUrl: string,
  repoInformation: GithubRepoInfo,
  selectedId: string,
) =>
  `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`;

export const uriToPutROS = (
  baseUrl: string,
  repoInformation: GithubRepoInfo,
  selectedId: string,
) =>
  `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`;

export const uriToPublishROS = (
  baseUrl: string,
  repoInformation: GithubRepoInfo,
  selectedId: string,
) =>
  `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/publish/${selectedId}`;

export const githubGetRequestHeaders = (accessToken: string): HeadersInit => ({
  'Github-Access-Token': accessToken,
});

export const githubPostRequestHeaders = (
  ghToken: string | null,
  microsoftToken: string,
): HeadersInit => {
  if (ghToken)
    return {
      'Github-Access-Token': ghToken,
      'Microsfot-Access-Token': microsoftToken,
      'Content-Type': 'application/json',
    };

  return {
    'Microsoft-Access-Token': microsoftToken,
    'Content-Type': 'application/json',
  };
};
