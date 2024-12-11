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
  RiSc,
  RiScStatus,
  RiScWithMetadata,
  SopsConfig,
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
  RiScDTO,
  SopsConfigRequestBody,
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
  createNewRiSc: (riSc: RiSc, generateDefault: boolean) => void;
  updateRiSc: (
    riSc: RiSc,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  approveRiSc: () => void;
  updateStatus: UpdateStatus;
  resetRiScStatus: () => void;
  resetResponse: () => void;
  createSopsConfig: (sopsConfig: SopsConfigRequestBody) => void;
  openPullRequestForSopsConfig: (branch: string) => void;
  updateSopsConfig: (sopsConfig: SopsConfigRequestBody, branch: string) => void;
  isFetching: boolean;
  isFetchingSopsConfig: boolean;
  failedToFetchSopsConfig: boolean;
  sopsConfigs: SopsConfig[];
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
    fetchSopsConfig,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    putSopsConfig,
    postSopsConfig,
    postOpenPullRequestForSopsConfig,
  } = useAuthenticatedFetch();

  const [riScs, setRiScs] = useState<RiScWithMetadata[] | null>(null);
  const [selectedRiSc, setSelectedRiSc] = useState<RiScWithMetadata | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const isFetchingRef = useRef(isFetching);
  const [isFetchingRiScs, setIsFetchingRiScs] = useState(true);
  const isFetchingRiScsRef = useRef(isFetchingRiScs);
  const [isFetchingSopsConfig, setIsFetchingSopsConfig] = useState(true);
  const isFetchingSopsConfigRef = useRef(isFetchingSopsConfig);
  const [failedToFetchSopsConfig, setFailedToFetchSopsConfig] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const [sopsConfigs, setSopsConfigs] = useState<SopsConfig[]>([]);
  const sopsConfigsRef = useRef(sopsConfigs);
  const [gcpCryptoKeys, setGcpCryptoKeys] = useState<GcpCryptoKeyObject[]>([]);

  useEffect(() => {
    if (location.state) {
      setResponse({
        statusMessage: location.state,
        status: ProcessingStatus.ErrorWhenFetchingRiScs,
      });
    }
  }, [location, setResponse]);

  // Initial fetch of SOPS config
  useEffectOnce(() => {
    fetchSopsConfig(
      res => {
        sopsConfigsRef.current = res.sopsConfigs;
        setSopsConfigs(sopsConfigsRef.current);
        // Sorts the crypto keys on whether the user has encrypt/decrypt role on it
        setGcpCryptoKeys(
          res.gcpCryptoKeys.sort((a, b) =>
            b.hasEncryptDecryptAccess === a.hasEncryptDecryptAccess
              ? 0
              : b.hasEncryptDecryptAccess
              ? 1
              : -1,
          ),
        );
        isFetchingSopsConfigRef.current = false;
        setIsFetchingSopsConfig(isFetchingSopsConfigRef.current);
        if (!isFetchingRiScsRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
      },
      _error => {
        setFailedToFetchSopsConfig(true);
        setResponse({
          status: ProcessingStatus.ErrorWhenFetchingSopsConfig,
          statusMessage: t('errorMessages.ErrorWhenFetchingSopsConfig'),
        });
        isFetchingSopsConfigRef.current = false;
        setIsFetchingSopsConfig(isFetchingSopsConfigRef.current);
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

        isFetchingRiScsRef.current = false;
        setIsFetchingRiScs(isFetchingRiScsRef.current);
        if (!isFetchingSopsConfigRef.current) {
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
      () => {
        isFetchingRiScsRef.current = false;
        setIsFetchingRiScs(isFetchingRiScsRef.current);
        if (!isFetchingSopsConfigRef.current) {
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

  const selectRiSc = (title: string) => {
    const selectedRiScId = riScs?.find(
      riSc => riSc.content.title === title,
    )?.id;
    if (selectedRiScId) {
      navigate(getRiScPath({ riScId: selectedRiScId }));
    }
  };

  const createNewRiSc = (riSc: RiSc, generateDefault: boolean) => {
    setIsFetching(true);
    setSelectedRiSc(null);

    const newRiSc: RiSc = {
      ...riSc,
      schemaVersion: latestSupportedVersion,
    };
    postRiScs(
      newRiSc,
      generateDefault,
      res => {
        if (!res.riScId) throw new Error('No RiSc ID returned');
        if (!res.riScContent) throw new Error('No RiSc content returned');
        const json = JSON.parse(res.riScContent) as RiScDTO;
        const content = dtoToRiSc(json);
        const riScWithMetaData: RiScWithMetadata = {
          id: res.riScId,
          status: RiScStatus.Draft,
          content: content,
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
        setUpdateStatus({
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
      },
      error => {
        setSelectedRiSc(selectedRiSc);
        setIsFetching(false);
        setUpdateStatus({
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
        error => {
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
            statusMessage: getTranslationKey('error', error.status, t),
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
        error => {
          setUpdateStatus({
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

  const createSopsConfig = (sopsConfigRequestBody: SopsConfigRequestBody) => {
    setUpdateStatus({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    putSopsConfig(
      sopsConfigRequestBody,
      res => {
        sopsConfigsRef.current = [res.sopsConfig, ...sopsConfigs];
        setSopsConfigs(sopsConfigsRef.current);
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
      error => {
        setUpdateStatus({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });
        setResponse({
          status: ProcessingStatus.FailedToCreateSops,
          statusMessage: getTranslationKey('error', error.status, t),
        });
      },
    );
  };

  const openPullRequestForSopsConfig = (branch: string) => {
    setUpdateStatus({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    postOpenPullRequestForSopsConfig(
      branch,
      res => {
        sopsConfigsRef.current = sopsConfigs.map(config =>
          config.branch === branch
            ? {
                gcpCryptoKey: config.gcpCryptoKey,
                publicAgeKeys: config.publicAgeKeys,
                branch: config.branch,
                onDefaultBranch: config.onDefaultBranch,
                pullRequest: res.pullRequest,
              }
            : config,
        );
        setSopsConfigs(sopsConfigsRef.current);
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
      error => {
        setUpdateStatus({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });
        setResponse({
          status: ProcessingStatus.FailedToCreateSops,
          statusMessage: getTranslationKey('error', error.status, t),
        });
      },
    );
  };

  const updateSopsConfig = (
    sopsConfigRequestBody: SopsConfigRequestBody,
    branch: string,
  ) => {
    setUpdateStatus({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });
    postSopsConfig(
      sopsConfigRequestBody,
      branch,
      res => {
        sopsConfigsRef.current = sopsConfigs.map(config =>
          config.branch === branch
            ? {
                ...config,
                gcpCryptoKey: sopsConfigRequestBody.gcpCryptoKey,
                publicAgeKeys: sopsConfigRequestBody.publicAgeKeys,
              }
            : config,
        );
        setSopsConfigs(sopsConfigsRef.current);
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
      error => {
        setUpdateStatus({
          isLoading: false,
          isError: true,
          isSuccess: false,
        });
        setResponse({
          status: ProcessingStatus.FailedToUpdateSops,
          statusMessage: getTranslationKey('error', error.status, t),
        });
      },
    );
  };

  const value = {
    riScs,
    selectRiSc,
    selectedRiSc,
    createSopsConfig,
    openPullRequestForSopsConfig,
    updateSopsConfig,
    createNewRiSc,
    updateRiSc,
    approveRiSc,
    updateStatus,
    resetRiScStatus,
    resetResponse,
    isRequesting,
    isFetching,
    isFetchingSopsConfig,
    failedToFetchSopsConfig,
    response,
    sopsConfigs,
    gcpCryptoKeys,
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
