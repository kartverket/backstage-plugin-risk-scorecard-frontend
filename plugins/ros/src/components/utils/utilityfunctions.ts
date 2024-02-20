import { GithubRepoInfo } from '../interface/interfaces';

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

export function generateRandomId(): string {
  return [...Array(3)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}
