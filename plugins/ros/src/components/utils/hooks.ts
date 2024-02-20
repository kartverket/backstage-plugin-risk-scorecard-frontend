import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { GithubRepoInfo, ROS, Scenario } from '../interface/interfaces';
import { emptyScenario } from '../ScenarioDrawer/ScenarioDrawer';
import {
  RosIdentifier,
  RosIdentifierResponseDTO,
  ROSProcessingStatus,
} from './types';
import { fetchROS, fetchROSIds } from './rosFunctions';

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
  string | null,
  (
    value: ((prevState: string | null) => string | null) | string | null,
  ) => void,
  RosIdentifier[] | null,
  (
    value:
      | ((prevState: RosIdentifier[] | null) => RosIdentifier[] | null)
      | RosIdentifier[]
      | null,
  ) => void,
] => {
  const baseUrl = useBaseUrl();

  const [rosIdsWithStatus, setRosIdsWithStatus] = useState<
    RosIdentifier[] | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      fetchROSIds(
        baseUrl,
        token,
        repoInformation,
        (rosIdentifiersResponseDTO: RosIdentifierResponseDTO) => {
          setRosIdsWithStatus(rosIdentifiersResponseDTO.rosIds);
          setSelectedId(rosIdentifiersResponseDTO.rosIds[0].id);
        },
      );
    } catch (error) {
      // Handle any synchronous errors that might occur outside the promise chain
      console.error('Unexpected error:', error);
    }
  }, [baseUrl, repoInformation, token]);

  return [selectedId, setSelectedId, rosIdsWithStatus, setRosIdsWithStatus];
};

export const useFetchRos = (
  selectedId: string | null,
  token: string | undefined,
  repoInformation: GithubRepoInfo | null,
): [ROS | undefined, Dispatch<SetStateAction<ROS | undefined>>] => {
  const baseUrl = useBaseUrl();
  const [ros, setRos] = useState<ROS>();

  useEffect(() => {
    fetchROS(baseUrl, token, selectedId, repoInformation, (fetchedROS: ROS) => {
      setRos(fetchedROS);
    });
  }, [baseUrl, repoInformation, selectedId, token]);

  return [ros, setRos];
};

export interface SubmitResponseObject {
  statusMessage: string;
  processingStatus: ROSProcessingStatus;
}

export const useDisplaySubmitResponse = (): [
  SubmitResponseObject | null,
  (submitStatus: SubmitResponseObject) => void,
] => {
  const [submitResponse, setSubmitResponse] =
    useState<SubmitResponseObject | null>(null);

  const displaySubmitResponse = (submitStatus: SubmitResponseObject) => {
    setSubmitResponse(submitStatus);
    setTimeout(() => {
      setSubmitResponse(null);
    }, 10000);
  };

  return [submitResponse, displaySubmitResponse];
};

export const useScenarioDrawer = (
  ros: ROS | undefined,
  setRos: (ros: ROS) => void,
  setDrawerIsOpen: (open: boolean) => void,
  putROS: (ros: ROS) => void,
): {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  saveScenario: () => void;
  editScenario: (id: string) => void;
  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: (id: string) => void;
  closeDeleteConfirmation: () => void;
  confirmDeletion: () => void;
} => {
  const [scenario, setScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

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

  const openDeleteConfirmation = (id: string) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDeleteConfirmationIsOpen(true);
    }
  };

  const confirmDeletion = () => {
    deleteScenario(scenario.ID);
  };

  const closeDeleteConfirmation = () => {
    if (ros) {
      setDeleteConfirmationIsOpen(false);
      setScenario(emptyScenario());
    }
  };

  const deleteScenario = (id: string) => {
    if (ros) {
      const updatedScenarios = ros.scenarier.filter(s => s.ID !== id);
      setRos({ ...ros, scenarier: updatedScenarios });
      putROS({ ...ros, scenarier: updatedScenarios });
    }
  };

  const editScenario = (id: string) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDrawerIsOpen(true);
    }
  };

  return {
    scenario,
    setScenario,
    saveScenario,
    editScenario,
    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeletion,
  };
};
