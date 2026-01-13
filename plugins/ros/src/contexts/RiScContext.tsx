import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useReducer,
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
  createNewRiSc: (
    riSc: RiScWithMetadata,
    generateInitialRisc: boolean,
    defaultRiScId: string | undefined,
  ) => void;
  deleteRiSc: (onSuccess?: () => void, onError?: () => void) => void;
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

const RiScContext = createContext<RiScDrawerProps | undefined>(undefined);

export function RiScProvider({ children }: { children: ReactNode }) {
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
    deleteRiScs,
    putRiScs,
    publishRiScs,
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

  type LocalState = {
    updateStatus: UpdateStatus;
    response: SubmitResponseObject | null;
  };

  type Action =
    | { type: 'SET_STATUS'; updateStatus: UpdateStatus }
    | { type: 'SET_RESPONSE'; response: SubmitResponseObject | null }
    | {
    type: 'SET_BOTH';
    updateStatus: UpdateStatus;
    response: SubmitResponseObject | null;
  };

  const initialLocalState: LocalState = {
    updateStatus: { isLoading: false, isError: false, isSuccess: false },
    response: null,
  };

  function reducer(state: LocalState, action: Action): LocalState {
    switch (action.type) {
      case 'SET_STATUS':
        return { ...state, updateStatus: action.updateStatus };
      case 'SET_RESPONSE':
        return { ...state, response: action.response };
      case 'SET_BOTH':
        return { updateStatus: action.updateStatus, response: action.response };
      default:
        return state;
    }
  }

  const [localState, dispatch] = useReducer(reducer, initialLocalState);

  const [gcpCryptoKeys, setGcpCryptoKeys] = useState<GcpCryptoKeyObject[]>([]);

  // Auto-clear response after a short duration to avoid the Alert sticking around
  const responseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (localState.response) {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
      responseTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'SET_RESPONSE', response: null });
        responseTimerRef.current = null;
      }, 10000);
    }

    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = null;
      }
    };
  }, [localState.response]);

  useEffect(() => {
    if (location.state) {
      dispatch({
        type: 'SET_RESPONSE',
        response: {
          statusMessage: location.state,
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
        },
      });
    }
  }, [location, dispatch]);

  // Initial fetch of GCP crypto keys
  useEffect(() => {
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
        dispatch({
          type: 'SET_RESPONSE',
          response: {
            status: ProcessingStatus.ErrorWhenFetchingGcpCryptoKeys,
            statusMessage: loginRejected
              ? `${t('errorMessages.ErrorWhenFetchingGcpCryptoKeys')}. ${t(
                'dictionary.rejectedLogin',
              )}`
              : t('errorMessages.ErrorWhenFetchingGcpCryptoKeys'),
          },
        });
        isFetchingGcpCryptoKeysRef.current = false;
        setIsFetchingGcpCryptoKeys(isFetchingGcpCryptoKeysRef.current);
        if (!isFetchingRiScsRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial fetch of RiScs
  useEffect(() => {
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
              lastPublished: riScDTO.lastPublished,
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
          dispatch({
            type: 'SET_RESPONSE',
            response: {
              statusMessage: t('errorMessages.ErrorWhenFetchingRiScs').concat(
                errorRiScIds,
              ),
              status: ProcessingStatus.ErrorWhenFetchingRiScs,
            },
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
        dispatch({
          type: 'SET_RESPONSE',
          response: {
            status: ProcessingStatus.ErrorWhenFetchingRiScs,
            statusMessage: loginRejected
              ? `${t('errorMessages.ErrorWhenFetchingRiScs')}. ${t(
                'dictionary.rejectedLogin',
              )}`
              : t('errorMessages.ErrorWhenFetchingRiScs'),
          },
        });
        isFetchingRiScsRef.current = false;
        setIsFetchingRiScs(isFetchingRiScsRef.current);
        if (!isFetchingGcpCryptoKeysRef.current) {
          isFetchingRef.current = false;
          setIsFetching(isFetchingRef.current);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    dispatch({
      type: 'SET_STATUS',
      updateStatus: { isLoading: false, isSuccess: false, isError: false },
    });
  }, [dispatch]);

  // use callback to avoid infinite loop
  const resetResponse = useCallback(() => {
    dispatch({ type: 'SET_RESPONSE', response: null });
  }, [dispatch]);

  function selectRiSc(id: string) {
    const selectedRiScId = riScs?.find(riSc => riSc.id === id)?.id;
    if (selectedRiScId) {
      navigate(getRiScPath({ riScId: selectedRiScId }));
    }
  }

  function createNewRiSc(
    riSc: RiScWithMetadata,
    generateInitialRisc: boolean,
    defaultRiScId: string | undefined,
  ) {
    setIsFetching(true);
    setSelectedRiSc(null);

    const newRiSc: RiScWithMetadata = {
      ...riSc,
      schemaVersion: latestSupportedVersion,
    };
    postRiScs(
      newRiSc.content,
      generateInitialRisc,
      newRiSc.sopsConfig,
      defaultRiScId,
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
          lastPublished: riSc.lastPublished,
        };
        setRiScs(riScs ? [...riScs, riScWithMetaData] : [riScWithMetaData]);
        setIsFetching(false);
        navigate(getRiScPath({ riScId: res.riScId }));
        dispatch({
          type: 'SET_BOTH',
          updateStatus: { isLoading: false, isError: false, isSuccess: true },
          response: {
            ...res,
            statusMessage: getTranslationKey('info', res.status, t),
          },
        });
      },
      (error: ProcessRiScResultDTO, loginRejected: boolean) => {
        setSelectedRiSc(selectedRiSc);
        setIsFetching(false);
        dispatch({
          type: 'SET_BOTH',
          updateStatus: { isLoading: false, isError: true, isSuccess: false },
          response: {
            ...error,
            statusMessage: loginRejected
              ? `${getTranslationKey('error', error.status, t)}. ${t(
                'dictionary.rejectedLogin',
              )}`
              : getTranslationKey('error', error.status, t),
          },
        });
      },
    );
  }

  function deleteRiSc(onSuccess?: () => void, onError?: () => void) {
    if (selectedRiSc && riScs) {
      const updatedRiSc = {
        ...selectedRiSc,
        status: RiScStatus.DeletionDraft,
      };
      const originalRiSc = selectedRiSc;

      dispatch({
        type: 'SET_STATUS',
        updateStatus: { isLoading: true, isError: false, isSuccess: false },
      });
      deleteRiScs(
        selectedRiSc.id,
        res => {
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: false, isSuccess: true },
            response: {
              ...res,
              statusMessage: getTranslationKey('info', res.status, t),
            },
          });
          setIsRequesting(false);
          if (res.status === ProcessingStatus.DeletedRiSc) {
            setSelectedRiSc(
              riScs.find(riSc => riSc.id !== selectedRiSc.id) || null,
            );
            setRiScs(riScs.filter(riSc => riSc.id !== updatedRiSc.id));
          } else {
            setSelectedRiSc(updatedRiSc);
            setRiScs(
              riScs.map(riSc =>
                riSc.id === selectedRiSc.id ? updatedRiSc : riSc,
              ),
            );
          }
          if (onSuccess) onSuccess();
          if (onSuccess) onSuccess();
        },
        (error, loginRejected) => {
          setSelectedRiSc(originalRiSc);
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: true, isSuccess: false },
            response: {
              ...error,
              statusMessage: loginRejected
                ? `${getTranslationKey('error', error.status, t)}. ${t(
                  'dictionary.rejectedLogin',
                )}`
                : getTranslationKey('error', error.status, t),
            },
          });
          setIsRequesting(false);
          if (onError) onError();
        },
      );
    }
  }

  function updateRiSc(
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
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
      dispatch({
        type: 'SET_STATUS',
        updateStatus: { isLoading: true, isError: false, isSuccess: false },
      });
      putRiScs(
        updatedRiSc,
        res => {
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: false, isSuccess: true },
            response: {
              ...res,
              statusMessage: getTranslationKey('info', res.status, t),
            },
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
          if (onSuccess) onSuccess();
        },
        (error, loginRejected) => {
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: true, isSuccess: false },
            response: {
              ...error,
              statusMessage: loginRejected
                ? `${getTranslationKey('error', error.status, t)}. ${t(
                  'dictionary.rejectedLogin',
                )}`
                : getTranslationKey('error', error.status, t),
            },
          });
          setIsRequesting(false);
          if (onError) onError();
          setSelectedRiSc(originalRiSc);
        },
      );
    }
  }

  const refetchRiScs = useCallback(() => {
    fetchRiScs(
      res => {
        const fetchedRiScs: RiScWithMetadata[] = res
          .filter(risk => risk.status === ContentStatus.Success)
          .map(riScDTO => {
            const json = JSON.parse(riScDTO.riScContent) as RiScDTO;
            const content = dtoToRiSc(json);
            return {
              id: riScDTO.riScId,
              content,
              sopsConfig: riScDTO.sopsConfig,
              status: riScDTO.riScStatus,
              pullRequestUrl: riScDTO.pullRequestUrl,
              migrationStatus: riScDTO.migrationStatus,
              lastPublished: riScDTO.lastPublished,
            };
          });

        setRiScs(fetchedRiScs);

        setSelectedRiSc(prev =>
          prev ? (fetchedRiScs.find(r => r.id === prev.id) ?? prev) : prev,
        );
      },
      loginRejected => {
        dispatch({
          type: 'SET_RESPONSE',
          response: {
            status: ProcessingStatus.ErrorWhenFetchingRiScs,
            statusMessage: loginRejected
              ? `${t('errorMessages.ErrorWhenFetchingRiScs')}. ${t('dictionary.rejectedLogin')}`
              : t('errorMessages.ErrorWhenFetchingRiScs'),
          },
        });
      },
    );
  }, [fetchRiScs, dispatch, t]);

  function approveRiSc() {
    if (selectedRiSc && riScs) {
      dispatch({
        type: 'SET_STATUS',
        updateStatus: { isLoading: true, isError: false, isSuccess: false },
      });
      publishRiScs(
        selectedRiSc.id,
        res => {
          const prUrl = res.pendingApproval?.pullRequestUrl;
          const updatedRiSc = {
            ...selectedRiSc,
            status:
              selectedRiSc.status === RiScStatus.Draft
                ? RiScStatus.SentForApproval
                : RiScStatus.DeletionSentForApproval,
            pullRequestUrl: prUrl,
          };
          setSelectedRiSc(updatedRiSc);
          setRiScs(
            riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)),
          );
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: false, isSuccess: true },
            response: {
              ...res,
              statusMessage: getTranslationKey('info', res.status, t),
            },
          });
        },
        (error, loginRejected) => {
          dispatch({
            type: 'SET_BOTH',
            updateStatus: { isLoading: false, isError: true, isSuccess: false },
            response: {
              ...error,
              statusMessage: loginRejected
                ? `${getTranslationKey('error', error.status, t)}. ${t('dictionary.rejectedLogin')}`
                : getTranslationKey('error', error.status, t),
            },
          });
        },
      );
    }
  }

  useEffect(() => {
    const s = selectedRiSc?.status;

    const shouldPoll =
      s === RiScStatus.SentForApproval ||
      s === RiScStatus.DeletionSentForApproval;

    if (!shouldPoll) {
      return undefined;
    }

    const id = window.setInterval(() => {
      refetchRiScs();
    }, 5000);

    return () => window.clearInterval(id);
  }, [selectedRiSc?.status, refetchRiScs]);

  const value = {
    riScs,
    selectRiSc,
    selectedRiSc,
    createNewRiSc,
    deleteRiSc,
    updateRiSc,
    approveRiSc,
    updateStatus: localState.updateStatus,
    resetRiScStatus,
    resetResponse,
    isRequesting,
    isFetching,
    response: localState.response,
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
}

export function useRiScs() {
  const context = useContext(RiScContext);
  if (context === undefined) {
    throw new Error('useRiScs must be used within a RiScProvider');
  }
  return context;
}
