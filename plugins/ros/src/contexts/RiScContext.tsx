import React, { ReactNode } from 'react';
import {
  ContentStatus,
  ProcessingStatus,
  RiSc,
  RiScStatus,
  RiScWithMetadata,
  SubmitResponseObject,
} from '../utils/types';
import { useCallback, useEffect, useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { requiresNewApproval } from '../utils/utilityfunctions';
import { riScRouteRef } from '../routes';
import { useLocation, useNavigate, useParams } from 'react-router';
import { dtoToRiSc, RiScDTO } from '../utils/DTOs';
import { useEffectOnce } from 'react-use';
import { useFetch } from '../utils/hooks';

type RiScUpdateStatus = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

type RiScDrawerProps = {
  riScs: RiScWithMetadata[] | null;
  selectRiSc: (title: string) => void;
  selectedRiSc: RiScWithMetadata | null;
  createNewRiSc: (riSc: RiSc) => void;
  updateRiSc: (
    riSc: RiSc,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  approveRiSc: () => void;
  riScUpdateStatus: RiScUpdateStatus;
  resetRiScStatus: () => void;
  isFetching: boolean;
  response: SubmitResponseObject | null;
};

const RiScContext = React.createContext<RiScDrawerProps | undefined>(undefined);

const RiScProvider = ({ children }: { children: ReactNode }) => {
  const { riScId: riScIdFromParams } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const getRiScPath = useRouteRef(riScRouteRef);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const {
    fetchRiScs,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    fetchLatestJSONSchema,
  } = useFetch();

  const [riScs, setRiScs] = useState<RiScWithMetadata[] | null>(null);
  const [selectedRiSc, setSelectedRiSc] = useState<RiScWithMetadata | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [riScUpdateStatus, setRiScUpdateStatus] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  useEffect(() => {
    if (location.state) {
      setResponse({
        statusMessage: location.state,
        status: ProcessingStatus.ErrorWhenFetchingRiScs,
      });
    }
  }, [location, setResponse]);

  // Initial fetch of RiScs
  useEffectOnce(() => {
    fetchRiScs(
      res => {
        const fetchedRiScs: RiScWithMetadata[] = res
          .filter(risk => risk.status === ContentStatus.Success)
          .map(riScDTO => {
            // This action can throw a runtime error if content is not parsable by JSON library.
            // If that happens, it is catched by the fetch onError catch.
            const json = JSON.parse(riScDTO.riScContent) as RiScDTO;

            const content = dtoToRiSc(json);
            return {
              id: riScDTO.riScId,
              content: content,
              status: riScDTO.riScStatus,
              pullRequestUrl: riScDTO.pullRequestUrl,
              migrationChanges: riScDTO.migrationChanges ? true : false,
            };
          });
        setRiScs(fetchedRiScs);
        setIsFetching(false);

        const errorRiScs: string[] = res
          .filter(risk => risk.status !== ContentStatus.Success)
          .map(risk => risk.riScId);

        if (errorRiScs.length > 0) {
          const errorMessage = `Failed to fetch risc scorecards with ids: ${errorRiScs.join(
            ', ',
          )}`;
          setResponse({
            statusMessage: errorMessage,
            status: ProcessingStatus.ErrorWhenFetchingRiScs,
          });
        }

        // If there are no RiScs, don't set a selected RiSc
        if (fetchedRiScs.length === 0) {
          return;
        }

        // If there is no RiSc ID in the URL, navigate to the first RiSc
        if (!riScIdFromParams) {
          navigate(getRiScPath({ riScId: fetchedRiScs[0].id }));
          return;
        }

        const riSc = fetchedRiScs.find(r => r.id === riScIdFromParams);

        // If there is an invalid RiSc ID in the URL, navigate to the first RiSc with error state
        if (!riSc) {
          navigate(getRiScPath({ riScId: fetchedRiScs[0].id }), {
            state: 'The risk scorecard you are trying to open does not exist',
          });
          return;
        }
      },
      () => setIsFetching(false),
    );
  });

  // Set selected RiSc based on URL
  useEffect(() => {
    if (riScIdFromParams) {
      const riSc = riScs?.find(r => r.id === riScIdFromParams);
      if (riSc) {
        setSelectedRiSc(riSc);
      }
    }
  }, [riScs, riScIdFromParams]);

  const resetRiScStatus = useCallback(() => {
    setRiScUpdateStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const selectRiSc = (title: string) => {
    const selectedRiScId = riScs?.find(
      riSc => riSc.content.title === title,
    )?.id;
    if (selectedRiScId) {
      navigate(getRiScPath({ riScId: selectedRiScId }));
    }
  };

  const createNewRiSc = (riSc: RiSc) => {
    setIsFetching(true);
    setSelectedRiSc(null);
    fetchLatestJSONSchema(
      res => {
        const resString = JSON.stringify(res);
        const schema = JSON.parse(resString);
        const schemaVersion = schema.properties.schemaVersion.default.replace(
          /'/g,
          '',
        );

        const newRiSc: RiSc = {
          ...riSc,
          schemaVersion: schemaVersion ? schemaVersion : '4.0',
        };

        postRiScs(
          newRiSc,
          res2 => {
            if (!res2.riScId) throw new Error('No RiSc ID returned');

            const RiScWithLatestSchemaVersion: RiScWithMetadata = {
              id: res2.riScId,
              status: RiScStatus.Draft,
              content: riSc,
              schemaVersion: riSc.schemaVersion,
            };

            setRiScs(
              riScs
                ? [...riScs, RiScWithLatestSchemaVersion]
                : [RiScWithLatestSchemaVersion],
            );
            setSelectedRiSc(RiScWithLatestSchemaVersion);
            setIsFetching(false);
            navigate(getRiScPath({ riScId: res2.riScId }));
          },
          () => {
            setSelectedRiSc(selectedRiSc);
            setIsFetching(false);
          },
        );
      },
      () => {
        const fallBackSchemaVersion = '4.0';
        const newRiSc: RiSc = {
          ...riSc,
          schemaVersion: fallBackSchemaVersion,
        };
        postRiScs(
          newRiSc,
          res2 => {
            if (!res2.riScId) throw new Error('No RiSc ID returned');

            const RiScWithLatestSchemaVersion: RiScWithMetadata = {
              id: res2.riScId,
              status: RiScStatus.Draft,
              content: riSc,
              schemaVersion: riSc.schemaVersion,
            };

            setRiScs(
              riScs
                ? [...riScs, RiScWithLatestSchemaVersion]
                : [RiScWithLatestSchemaVersion],
            );
            setSelectedRiSc(RiScWithLatestSchemaVersion);
            setIsFetching(false);
            navigate(getRiScPath({ riScId: res2.riScId }));
          },
          () => {
            setSelectedRiSc(selectedRiSc);
            setIsFetching(false);
          },
        );
      },
    );
  };

  const updateRiSc = (
    riSc: RiSc,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (selectedRiSc && riScs) {
      const isRequiresNewApproval = requiresNewApproval(
        selectedRiSc.content,
        riSc,
      );
      const updatedRiSc = {
        ...selectedRiSc,
        content: riSc,
        status:
          selectedRiSc.status !== RiScStatus.Draft && isRequiresNewApproval
            ? RiScStatus.Draft
            : selectedRiSc.status,
        isRequiresNewApproval: isRequiresNewApproval,
        schemaVersion: riSc.schemaVersion,
        migrationChanges: false,
      };

      setRiScUpdateStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      putRiScs(
        updatedRiSc,
        () => {
          setRiScUpdateStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          setSelectedRiSc(updatedRiSc);
          setRiScs(
            riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)),
          );
          setIsRequesting(false);
          if (onSuccess) onSuccess();
        },
        () => {
          setRiScUpdateStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setIsRequesting(false);
          if (onError) onError();
        },
      );
    }
  };

  const approveRiSc = () => {
    if (selectedRiSc && riScs) {
      const updatedRiSc = {
        ...selectedRiSc,
        status: RiScStatus.SentForApproval,
      };

      publishRiScs(selectedRiSc.id, () => {
        setSelectedRiSc(updatedRiSc);
        setRiScs(riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)));
      });
    }
  };

  const value = {
    riScs,
    selectRiSc,
    selectedRiSc,
    createNewRiSc,
    updateRiSc,
    approveRiSc,
    riScUpdateStatus,
    resetRiScStatus,
    isRequesting,
    isFetching,
    response,
  };

  return <RiScContext.Provider value={value}>{children}</RiScContext.Provider>;
};

const useRiScs = () => {
  const context = React.useContext(RiScContext);
  if (context === undefined) {
    throw new Error('useRiScs must be used within a RiScProvider');
  }
  return context;
};

export { RiScProvider, useRiScs };
