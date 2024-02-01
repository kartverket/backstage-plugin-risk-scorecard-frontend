import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { GithubRepoInfo, ROS, Scenario } from '../interface/interfaces';
import { emptyScenario } from '../ScenarioDrawer/ScenarioDrawer';
import {
  ROSContentResultDTO,
  RosIdentifier,
  RosIdentifierResponseDTO,
} from './types';

export const useBaseUrl = () => {
  return useApi(configApiRef).getString('app.backendUrl');
};

export const useGithubRepositoryInformation = (): GithubRepoInfo | null => {
  const currentEntity = useAsyncEntity();
  const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);

  useEffect(() => {
    if (!currentEntity.loading && currentEntity.entity !== undefined) {
      const slug =
        currentEntity.entity.metadata.annotations !== undefined
          ? currentEntity.entity.metadata.annotations[
              'github.com/project-slug'
            ].split('/')
          : null;

      if (slug === null) return;

      setRepoInfo({
        name: slug[1],
        owner: slug[0],
      });
    }
  }, [currentEntity.entity, currentEntity.loading]);

  return repoInfo;
};

export const useFetchRosIds = (
  token: string | undefined,
  repoInformation: GithubRepoInfo | null,
): [
  string[] | null,
  string | null,
  (
    value: ((prevState: string | null) => string | null) | string | null,
  ) => void,
  RosIdentifier[] | null,
] => {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useBaseUrl();

  const [rosIds, setRosIds] = useState<string[] | null>(null);
  const [rosIdsWithStatus, setRosIdsWithStatus] = useState<
    RosIdentifier[] | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (token && repoInformation) {
      try {
        fetch(
          `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/ids`,
          {
            headers: { 'Github-Access-Token': token },
          },
        )
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then(json => json as RosIdentifierResponseDTO)
          .then(rosIdentifiersResponseDTO => {
            setRosIds(
              rosIdentifiersResponseDTO.rosIds.map(
                rosIdentifier => rosIdentifier.id,
              ),
            );
            setRosIdsWithStatus(rosIdentifiersResponseDTO.rosIds);
            setSelectedId(rosIdentifiersResponseDTO.rosIds[0].id);
          })
          .catch(error => {
            // Handle the error here, you can log it or show a user-friendly message
            console.error('Error fetching ROS IDs:', error);
          });
      } catch (error) {
        // Handle any synchronous errors that might occur outside the promise chain
        console.error('Unexpected error:', error);
      }
    }
  }, [baseUrl, fetch, repoInformation, token]);

  return [rosIds, selectedId, setSelectedId, rosIdsWithStatus];
};

export const useFetchRos = (
  selectedId: string | null,
  token: string | undefined,
  repoInformation: GithubRepoInfo | null,
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
        .then(json => json as ROSContentResultDTO)
        .then(fetchedRos => {
          if (fetchedRos.rosContent !== null) {
            const rosContent = JSON.parse(fetchedRos.rosContent) as ROS;
            setRos(rosContent);
          } else
            console.log(
              `Kunne ikke hente ros med status: ${fetchedRos.status}`,
            );
        });
    }
  }, [baseUrl, fetch, repoInformation, selectedId, token]);

  return [ros, setRos];
};

export const useDisplaySubmitResponse = (): [
  string,
  (text: string) => void,
] => {
  const [submitResponse, setSubmitResponse] = useState<string>('');

  const displaySubmitResponse = (text: string) => {
    setSubmitResponse(text);
    setTimeout(() => {
      setSubmitResponse('');
    }, 3000);
  };

  return [submitResponse, displaySubmitResponse];
};

export const useScenarioDrawer = (
  ros: ROS | undefined,
  setRos: (ros: ROS) => void,
  setDrawerIsOpen: (open: boolean) => void,
  putROS: (ros: ROS) => void,
): [
  Scenario,
  (scenario: Scenario) => void,
  () => void,
  (index: number) => void,
  (index: number) => void,
] => {
  const [scenario, setScenario] = useState(emptyScenario());

  const saveScenario = () => {
    if (ros) {
      const updatedScenarios = ros.scenarier.some(s => s.ID === scenario.ID)
        ? ros.scenarier.map(s => (s.ID === scenario.ID ? scenario : s))
        : ros.scenarier.concat(scenario);
      setRos({ ...ros, scenarier: updatedScenarios });
      putROS({ ...ros, scenarier: updatedScenarios });
      setDrawerIsOpen(false);
    }
  };

  const deleteScenario = (index: number) => {
    if (ros) {
      const updatedScenarios = ros.scenarier.filter((_, i) => i !== index);
      setRos({ ...ros, scenarier: updatedScenarios });
      putROS({ ...ros, scenarier: updatedScenarios });
    }
  };

  const editScenario = (index: number) => {
    if (ros) {
      setScenario(ros.scenarier.at(index)!!);
      setDrawerIsOpen(true);
    }
  };

  return [scenario, setScenario, saveScenario, deleteScenario, editScenario];
};
