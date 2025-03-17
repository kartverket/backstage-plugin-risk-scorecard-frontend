import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ContentStatus,
  ProcessingStatus,
  RiScStatus,
  RiScWithMetadata,
  SubmitResponseObject,
} from '../utils/types';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  getTranslationKey,
  requiresNewApproval,
} from '../utils/utilityfunctions';
import { riScRouteRef } from '../routes';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  dtoToRiSc,
  GcpCryptoKeyObject,
  ProcessRiScResultDTO,
  RiScDTO,
} from '../utils/DTOs';
import { useEffectOnce } from 'react-use';
import { useAuthenticatedFetch } from '../utils/hooks';
import { latestSupportedVersion } from '../utils/constants';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

export type UpdateStatus = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

type RiScDrawerProps = {
  riScs: RiScWithMetadata[] | null;
  selectRiSc: (title: string) => void;
  selectedRiSc: RiScWithMetadata | null;
  createNewRiSc: (riSc: RiScWithMetadata, generateDefault: boolean) => void;
  updateRiSc: (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  approveRiSc: () => void;
  updateStatus: UpdateStatus;
  resetRiScStatus: () => void;
  resetResponse: () => void;
  isFetching: boolean;
  isFetchingGcpCryptoKeys: boolean;
  failedToFetchGcpCryptoKeys: boolean;
  gcpCryptoKeys: GcpCryptoKeyObject[];
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
    fetchGcpCryptoKeys,
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
  const isFetchingRef = useRef(isFetching);
  const [isFetchingRiScs, setIsFetchingRiScs] = useState(true);
  const isFetchingRiScsRef = useRef(isFetchingRiScs);
  const [isFetchingGcpCryptoKeys, setIsFetchingGcpCryptoKeys] = useState(true);
  const isFetchingGcpCryptoKeysRef = useRef(isFetchingGcpCryptoKeys);
  const [updateStatus, setUpdateStatus] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const [gcpCryptoKeys, setGcpCryptoKeys] = useState<GcpCryptoKeyObject[]>([]);

  useEffect(() => {
    if (location.state) {
      setResponse({
        statusMessage: location.state,
        status: ProcessingStatus.ErrorWhenFetchingRiScs,
      });
    }
  }, [location, setResponse]);

  // Initial fetch of GCP crypto keys
  useEffectOnce(() => {
    fetchGcpCryptoKeys(
      res => {
        setGcpCryptoKeys(res);
        // Sorts the crypto keys on whether the user has encrypt/decrypt role on it
        setGcpCryptoKeys(
          res.sort((a, b) => {
            if (b.hasEncryptDecryptAccess === a.hasEncryptDecryptAccess) {
              return 0;
            }
            return b.hasEncryptDecryptAccess ? 1 : -1;
          }),
        );
        isFetchingGcpCryptoKeysRef.current = false;
        setIsFetchingGcpCryptoKeys(isFetchingGcpCryptoKeysRef.current);
        if (!isFetchingRiScsRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
      },
      (_error, loginRejected) => {
        setResponse({
          status: ProcessingStatus.ErrorWhenFetchingGcpCryptoKeys,
          statusMessage: loginRejected
            ? `${t('errorMessages.ErrorWhenFetchingGcpCryptoKeys')}. ${t(
                'dictionary.rejectedLogin',
              )}`
            : t('errorMessages.ErrorWhenFetchingGcpCryptoKeys'),
        });
        isFetchingGcpCryptoKeysRef.current = false;
        setIsFetchingGcpCryptoKeys(isFetchingGcpCryptoKeysRef.current);
        if (!isFetchingRiScsRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
      },
    );
  });

  // Initial fetch of RiScs
  useEffectOnce(() => {
    fetchRiScs(
      res => {
        const fetchedRiScs: RiScWithMetadata[] = res
          .filter(risk => risk.status === ContentStatus.Success)
          .map(riScDTO => {
            const json = JSON.parse(riScDTO.riScContent) as RiScDTO;

            const content = dtoToRiSc(json);
            return {
              id: riScDTO.riScId,
              content: content,
              sopsConfig: riScDTO.sopsConfig,
              status: riScDTO.riScStatus,
              pullRequestUrl: riScDTO.pullRequestUrl,
              migrationStatus: riScDTO.migrationStatus,
              numOfGeneralCommitsBehindMain:
                riScDTO.numOfGeneralCommitsBehindMain,
            };
          });
        setRiScs(fetchedRiScs);
        isFetchingRiScsRef.current = false;
        setIsFetchingRiScs(isFetchingRiScsRef.current);
        if (!isFetchingGcpCryptoKeysRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }

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
      loginRejected => {
        setResponse({
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
          statusMessage: loginRejected
            ? `${t('errorMessages.ErrorWhenFetchingRiScs')}. ${t(
                'dictionary.rejectedLogin',
              )}`
            : t('errorMessages.ErrorWhenFetchingRiScs'),
        });
        isFetchingRiScsRef.current = false;
        setIsFetchingRiScs(isFetchingRiScsRef.current);
        if (!isFetchingGcpCryptoKeysRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
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
    setUpdateStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // use callback to avoid infinite loop
  const resetResponse = useCallback(() => {
    setResponse(null);
  }, [setResponse]);

  const selectRiSc = (id: string) => {
    const selectedRiScId = riScs?.find(riSc => riSc.id === id)?.id;
    if (selectedRiScId) {
      navigate(getRiScPath({ riScId: selectedRiScId }));
    }
  };

  const createNewRiSc = (riSc: RiScWithMetadata, generateDefault: boolean) => {
    setIsFetching(true);
    setSelectedRiSc(null);

    const newRiSc: RiScWithMetadata = {
      ...riSc,
      schemaVersion: latestSupportedVersion,
    };
    postRiScs(
      newRiSc.content,
      generateDefault,
      newRiSc.sopsConfig,
      res => {
        if (!res.riScId) throw new Error('No RiSc ID returned');
        if (!res.riScContent) throw new Error('No RiSc content returned');
        const json = JSON.parse(res.riScContent) as RiScDTO;
        const content = dtoToRiSc(json);
        const riScWithMetaData: RiScWithMetadata = {
          id: res.riScId,
          status: RiScStatus.Draft,
          content: content,
          sopsConfig: riSc.sopsConfig,
          schemaVersion: riSc.schemaVersion,
        };
        setRiScs(riScs ? [...riScs, riScWithMetaData] : [riScWithMetaData]);
        setIsFetching(false);
        navigate(getRiScPath({ riScId: res.riScId }));
        setResponse({
          ...res,
          statusMessage: getTranslationKey('info', res.status, t),
        });
        setUpdateStatus({
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
      },
      (error: ProcessRiScResultDTO, loginRejected: boolean) => {
        setSelectedRiSc(selectedRiSc);
        setIsFetching(false);
        setUpdateStatus({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });

        setResponse({
          ...error,
          statusMessage: loginRejected
            ? `${getTranslationKey('error', error.status, t)}. ${t(
                'dictionary.rejectedLogin',
              )}`
            : getTranslationKey('error', error.status, t),
        });
      },
    );
  };

  const updateRiSc = (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (selectedRiSc && riScs) {
      const isRequiresNewApproval =
        selectedRiSc.migrationStatus?.migrationRequiresNewApproval ||
        requiresNewApproval(selectedRiSc.content, riSc.content);

      const updatedRiSc: RiScWithMetadata = {
        ...selectedRiSc,
        sopsConfig: riSc.sopsConfig,
        content: riSc.content,
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
      const originalRiSc = selectedRiSc;
      setSelectedRiSc(updatedRiSc);
      setUpdateStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      putRiScs(
        updatedRiSc,
        res => {
          setUpdateStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          if ('pendingApproval' in res && res.pendingApproval?.pullRequestUrl) {
            updatedRiSc.pullRequestUrl = res.pendingApproval.pullRequestUrl;
            updatedRiSc.status = RiScStatus.SentForApproval;
          }
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
        (error, loginRejected) => {
          setUpdateStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setIsRequesting(false);
          if (onError) onError();
          setSelectedRiSc(originalRiSc);
          setResponse({
            ...error,
            statusMessage: loginRejected
              ? `${getTranslationKey('error', error.status, t)}. ${t(
                  'dictionary.rejectedLogin',
                )}`
              : getTranslationKey('error', error.status, t),
          });
        },
      );
    }
  };

  const approveRiSc = () => {
    if (selectedRiSc && riScs) {
      setUpdateStatus({
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
          setUpdateStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          setResponse({
            ...res,
            statusMessage: getTranslationKey('info', res.status, t),
          });
        },
        (error, loginRejected) => {
          setUpdateStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setResponse({
            ...error,
            statusMessage: loginRejected
              ? `${getTranslationKey('error', error.status, t)}. ${t(
                  'dictionary.rejectedLogin',
                )}`
              : getTranslationKey('error', error.status, t),
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
    updateStatus,
    resetRiScStatus,
    resetResponse,
    isRequesting,
    isFetching,
    response,
    gcpCryptoKeys,
  };

  return (
    <RiScContext.Provider
      value={{
        ...value,
        isFetchingGcpCryptoKeys: false,
        failedToFetchGcpCryptoKeys: false,
      }}
    >
      {children}
    </RiScContext.Provider>
  );
};

const useRiScs = () => {
  const context = React.useContext(RiScContext);
  if (context === undefined) {
    throw new Error('useRiScs must be used within a RiScProvider');
  }
  return context;
};

export { RiScProvider, useRiScs };
