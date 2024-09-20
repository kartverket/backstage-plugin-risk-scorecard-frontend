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
import {
  getTranslationKey,
  requiresNewApproval,
} from '../utils/utilityfunctions';
import { riScRouteRef } from '../routes';
import { useLocation, useNavigate, useParams } from 'react-router';
import { dtoToRiSc, RiScDTO } from '../utils/DTOs';
import { useEffectOnce } from 'react-use';
import { useAuthenticatedFetch } from '../utils/hooks';
import { latestSupportedVersion } from '../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

export type RiScUpdateStatus = {
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
  resetResponse: () => void;
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
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const {
    fetchRiScs,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
  } = useAuthenticatedFetch();

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
              migrationStatus: riScDTO.migrationStatus,
            };
          });
        setRiScs(fetchedRiScs);
        setIsFetching(false);

        const errorRiScs: string[] = res
          .filter(risk => risk.status !== ContentStatus.Success)
          .map(risk => risk.riScId);

        if (errorRiScs.length > 0) {
          const errorRiScIds = errorRiScs.join(', ');
          setResponse({
            statusMessage: t('errorMessages.ErrorWhenFetchingRiScs').concat(
              errorRiScIds,
            ),
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
            state: t('errorMessages.RiScDoesNotExist'),
          });
          return;
        }
      },
      () => {
        setIsFetching(false);
      },
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

  // use callback to avoid infinite loop
  const resetResponse = useCallback(() => {
    setResponse(null);
  }, [setResponse]);

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

    const newRiSc: RiSc = {
      ...riSc,
      schemaVersion: latestSupportedVersion,
    };
    postRiScs(
      newRiSc,
      res => {
        if (!res.riScId) throw new Error('No RiSc ID returned');
        const riScWithMetaData: RiScWithMetadata = {
          id: res.riScId,
          status: RiScStatus.Draft,
          content: riSc,
          schemaVersion: riSc.schemaVersion,
        };

        setRiScs(riScs ? [...riScs, riScWithMetaData] : [riScWithMetaData]);
        setSelectedRiSc(riScWithMetaData);
        setIsFetching(false);
        navigate(getRiScPath({ riScId: res.riScId }));
        setResponse({
          ...res,
          statusMessage: getTranslationKey('info', res.status, t),
        });
        setRiScUpdateStatus({
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
      },
      error => {
        setSelectedRiSc(selectedRiSc);
        setIsFetching(false);
        setRiScUpdateStatus({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });

        setResponse({
          ...error,
          statusMessage: getTranslationKey('error', error.status, t),
        });
      },
    );
  };

  const updateRiSc = (
    riSc: RiSc,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (selectedRiSc && riScs) {
      const isRequiresNewApproval =
        selectedRiSc.migrationStatus?.migrationRequiresNewApproval ||
        requiresNewApproval(selectedRiSc.content, riSc);

      const updatedRiSc = {
        ...selectedRiSc,
        content: riSc,
        status:
          selectedRiSc.status !== RiScStatus.Draft && isRequiresNewApproval
            ? RiScStatus.Draft
            : selectedRiSc.status,
        isRequiresNewApproval: isRequiresNewApproval,
        schemaVersion: riSc.schemaVersion,
        migrationStatus: {
          migrationChanges: false,
          migrationRequiresNewApproval: false,
        },
      };

      setRiScUpdateStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      putRiScs(
        updatedRiSc,
        res => {
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
          setResponse({
            ...res,
            statusMessage: getTranslationKey('info', res.status, t),
          });
        },
        error => {
          setRiScUpdateStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setIsRequesting(false);
          if (onError) onError();
          setResponse({
            ...error,
            statusMessage: getTranslationKey('error', error.status, t),
          });
        },
      );
    }
  };

  const approveRiSc = () => {
    if (selectedRiSc && riScs) {
      setRiScUpdateStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      publishRiScs(
        selectedRiSc.id,
        res => {
          const prUrl = res.pendingApproval?.pullRequestUrl;
          const updatedRiSc = {
            ...selectedRiSc,
            status: RiScStatus.SentForApproval,
            pullRequestUrl: prUrl,
          };
          setSelectedRiSc(updatedRiSc);
          setRiScs(
            riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)),
          );
          setRiScUpdateStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          setResponse({
            ...res,
            statusMessage: getTranslationKey('info', res.status, t),
          });
        },
        error => {
          setRiScUpdateStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setResponse({
            ...error,
            statusMessage: getTranslationKey('error', error.status, t),
          });
        },
      );
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
    resetResponse,
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
