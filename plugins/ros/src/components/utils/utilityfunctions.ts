import {
  GithubRepoInfo,
  Risiko,
  ROS,
  Scenario,
  TableData,
} from '../interface/interfaces';

export function mapToTableData(data: ROS): TableData[] {
  return data.scenarier.map((scenario: Scenario, id) => {
    const riskData = scenario.risiko;
    const risk: Risiko = {
      sannsynlighet: riskData.sannsynlighet,
      konsekvens: riskData.konsekvens,
      oppsummering: riskData.oppsummering,
    };

    const tableRow: TableData = {
      beskrivelse: scenario.beskrivelse,
      trussel: scenario.trusselaktører ? scenario.trusselaktører[0] : '',
      sårbarhet: scenario.sårbarheter ? scenario.sårbarheter[0] : '',
      konsekvens: risk.konsekvens,
      sannsynlighet: risk.sannsynlighet,
      id: id,
    };
    return tableRow;
  });
}

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

export const githubPostRequestHeaders = (accessToken: string): HeadersInit => ({
  'Github-Access-Token': accessToken,
  'Content-Type': 'application/json',
});
