import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { githubAuthApiRef, useApi } from '@backstage/core-plugin-api';
import { GithubRepoInfo, ROS, Scenario } from '../interface/interfaces';
import { emptyScenario } from '../ScenarioDrawer/ScenarioDrawer';
import { RosIdentifier } from './types';
import { useFetch } from './rosFunctions';
import useAsync from 'react-use/lib/useAsync';

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
  setDrawerIsOpen: (open: boolean) => void,
  onChange: (ros: ROS) => void,
): {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  saveScenario: () => void;
  editScenario: (id: number) => void;
  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: (id: number) => void;
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
      onChange({ ...ros, scenarier: updatedScenarios });
      setDrawerIsOpen(false);
    }
  };

  const openDeleteConfirmation = (id: number) => {
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

  const deleteScenario = (id: number) => {
    if (ros) {
      const updatedScenarios = ros.scenarier.filter(s => s.ID !== id);
      onChange({ ...ros, scenarier: updatedScenarios });
    }
  };

  const editScenario = (id: number) => {
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

export const useROSPlugin = () => {
  const GHApi = useApi(githubAuthApiRef);
  const { value: accessToken } = useAsync(() => GHApi.getAccessToken('repo'));
  const repoInformation = useGithubRepositoryInformation();

  const { fetchROSIds, fetchROS, postROS, putROS, publishROS } = useFetch(
    accessToken,
    repoInformation,
  );

  const useFetchRos = (
    selectedId: RosIdentifier | null,
  ): [ROS | undefined, Dispatch<SetStateAction<ROS | undefined>>] => {
    const [ros, setRos] = useState<ROS>();

    useEffect(() => {
      if (selectedId) {
        fetchROS(selectedId.id, (fetchedROS: ROS) => setRos(fetchedROS));
      }
    }, [selectedId]);

    return [ros, setRos];
  };

  const useFetchRosIds = (): [
    RosIdentifier | null,
    Dispatch<SetStateAction<RosIdentifier | null>>,
    RosIdentifier[] | null,
    Dispatch<SetStateAction<RosIdentifier[] | null>>,
  ] => {
    const [rosIds, setRosIds] = useState<RosIdentifier[] | null>(null);
    const [selectedId, setSelectedId] = useState<RosIdentifier | null>(null);

    useEffect(() => {
      try {
        fetchROSIds((rosIds: RosIdentifier[]) => {
          setRosIds(rosIds);
          setSelectedId(rosIds[0]);
        });
      } catch (error) {
        // Handle any synchronous errors that might occur outside the promise chain
        console.error('Unexpected error:', error);
      }
    }, []);

    return [selectedId, setSelectedId, rosIds, setRosIds];
  };

  return {
    useFetchRos,
    useFetchRosIds,
    postROS,
    putROS,
    publishROS,
  };
};
