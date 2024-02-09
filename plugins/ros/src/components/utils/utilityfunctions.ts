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

export const githubGetRequestHeaders = (accessToken: string): HeadersInit => ({
  'Github-Access-Token': accessToken,
});

export const githubPostRequestHeaders = (accessToken: string): HeadersInit => ({
  'Github-Access-Token': accessToken,
  'Content-Type': 'application/json',
});
