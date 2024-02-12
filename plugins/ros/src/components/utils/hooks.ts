import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import {
  GithubRepoInfo,
  ROS,
  ROSTitleAndIdAndStatus,
  ROSWrapper,
  Scenario,
} from '../interface/interfaces';
import { emptyScenario } from '../ScenarioDrawer/ScenarioDrawer';
import { RosIdentifier, RosIdentifierResponseDTO, RosStatus } from './types';
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

export const useFetchRoses = (
  token: string | undefined,
  repoInformation: GithubRepoInfo | null,
): [
  ROS | null,
  Dispatch<SetStateAction<ROS | null>>,
  ROSTitleAndIdAndStatus[] | null,
  Dispatch<SetStateAction<ROSTitleAndIdAndStatus[] | null>>,
  ROSTitleAndIdAndStatus | null,
  (title: string) => void,
] => {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useBaseUrl();

  const [roses, setRoses] = useState<ROS[] | null>(null);
  const [selectedROS, setSelectedROS] = useState<ROS | null>(null);
  const [titlesAndIds, setTitlesAndIds] = useState<
    ROSTitleAndIdAndStatus[] | null
  >(null);
  const [selectedTitleAndId, setSelectedTitleAndId] =
    useState<ROSTitleAndIdAndStatus | null>(null);

  useEffect(() => {
    if (token && repoInformation) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}`,
        {
          headers: { 'Github-Access-Token': token },
        },
      )
        .then(res => res.json())
        .then((response): ROSWrapper[] => {
          const fetchedRoses: ROSWrapper[] = response.map((item: any) => ({
            id: item.name,
            content: JSON.parse(item.content) as ROS,
          }));

          setRoses(fetchedRoses.map((ros: ROSWrapper) => ros.content as ROS));

          setTitlesAndIds(
            fetchedRoses.map((ros: ROSWrapper) => ({
              tittel: ros.content.tittel,
              id: ros.id,
              status: RosStatus.Draft,
            })),
          );

          setSelectedTitleAndId({
            tittel: fetchedRoses[0].content.tittel,
            id: fetchedRoses[0].id,
            status: RosStatus.Draft,
          });

          setSelectedROS(
            fetchedRoses.length > 0 ? (fetchedRoses[0].content as ROS) : null,
          );
          return fetchedRoses;
        });
    }
  }, [token]);

  const selectROSByTitle = (title: string) => {
    const pickedRos = roses?.find(ros => ros.tittel === title) || null;
    const pickedTitleAndId =
      titlesAndIds?.find(t => t.tittel === title) || null;
    setSelectedROS(pickedRos);
    setSelectedTitleAndId(pickedTitleAndId);
  };

  return [
    selectedROS,
    setSelectedROS,
    titlesAndIds,
    setTitlesAndIds,
    selectedTitleAndId,
    selectROSByTitle,
  ];
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
  ros: ROS | null,
  setRos: (ros: ROS) => void,
  setDrawerIsOpen: (open: boolean) => void,
  putROS: (ros: ROS) => void,
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
      setRos({ ...ros, scenarier: updatedScenarios });
      putROS({ ...ros, scenarier: updatedScenarios });
      setDrawerIsOpen(false);
    }
  };

  const openDeleteConfirmation = (id: number) => {
    if (ros) {
      setScenario(ros.scenarier.find(s => s.ID === id)!!);
      setDeleteConfirmationIsOpen(true);
    }
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
      setRos({ ...ros, scenarier: updatedScenarios });
      putROS({ ...ros, scenarier: updatedScenarios });
    }
  };

  const confirmDeletion = () => {
    deleteScenario(scenario.ID);
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
