import { EntityLoadingStatus } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { GithubRepositoryInformation, ROS } from '../interface/interfaces';

export const useBaseUrl = () => {
  return useApi(configApiRef).getString('app.backendUrl');
};

export const useGithubRepositoryInformation = (
  currentEntity: EntityLoadingStatus,
): GithubRepositoryInformation | null => {
  const [repoInformation, setRepoInformation] =
    useState<GithubRepositoryInformation | null>(null);

  useEffect(() => {
    if (!currentEntity.loading && currentEntity.entity !== undefined) {
      const slug =
        currentEntity.entity.metadata.annotations !== undefined
          ? currentEntity.entity.metadata.annotations[
              'github.com/project-slug'
            ].split('/')
          : null;

      if (slug === null) return;

      setRepoInformation({
        name: slug[1],
        owner: slug[0],
      });
    }
  }, [currentEntity.entity, currentEntity.loading]);

  return repoInformation;
};

export const useFetchRosIds = (
  token: string | undefined,
  repoInformation: GithubRepositoryInformation | null,
): [
  string[] | null,
  string | null,
  Dispatch<SetStateAction<string | null>>,
] => {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useBaseUrl();

  const [rosIds, setRosIds] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (token && repoInformation) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/ids`,
        {
          headers: { 'Github-Access-Token': token },
        },
      )
        .then(res => res.json())
        .then(json => json as string[])
        .then(ids => {
          setRosIds(ids);
          setSelectedId(ids[0]);
        });
    }
  }, [token]);

  return [rosIds, selectedId, setSelectedId];
};

export const useFetchRos = (
  selectedId: string | null,
  token: string | undefined,
  repoInformation: GithubRepositoryInformation | null,
): [ROS | undefined, Dispatch<SetStateAction<ROS | undefined>>] => {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useBaseUrl();

  const [ros, setRos] = useState<ROS>();

  useEffect(() => {
    if (selectedId && token && repoInformation) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`,
        {
          headers: { 'Github-Access-Token': token },
        },
      )
        .then(res => res.json())
        .then(json => json as ROS)
        .then(fetchedRos => setRos(fetchedRos));
    }
  }, [selectedId, token]);

  return [ros, setRos];
};
