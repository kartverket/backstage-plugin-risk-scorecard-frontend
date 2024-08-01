import { useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useEffect, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  ContentStatus,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScStatus,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import { requiresNewApproval } from './utilityfunctions';
import { riScRouteRef } from '../routes';
import { useLocation, useNavigate } from 'react-router';
import {
  dtoToRiSc,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  RiScDTO,
  riScToDTOString,
} from './DTOs';
import { useEffectOnce } from 'react-use';

const useGithubRepositoryInformation = (): GithubRepoInfo => {
  const [, org, repo] =
    useEntity().entity.metadata.annotations?.['backstage.io/view-url'].match(
      /github\.com\/([^\/]+)\/([^\/]+)/,
    ) || [];

  return {
    owner: org,
    name: repo,
  };
};

const useResponse = (): [
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

const useFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch: fetchApi } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = () => `${riScUri}/all`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const uriToFetchLatestJSONSchema = () =>
    `${backendUrl}/api/proxy/risc-proxy/api/risc/schemas/latest`;

  const [response, setResponse] = useResponse();

  const fetch = <T>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: T) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken([
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloudkms',
      ]),
    ]).then(([idToken, googleAccessToken]) => {
      fetchApi(uri, {
        method: method,
        headers: {
          Authorization: `Bearer ${idToken.token}`,
          'GCP-Access-Token': googleAccessToken,
          'Content-Type': 'application/json',
        },
        body: body,
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then(json => json as T)
        .then(res => onSuccess(res))
        .catch(error => onError(error));
    });
  };

  const fetchRiScs = (
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: () => void,
  ) =>
    fetch<RiScContentResultDTO[]>(
      uriToFetchAllRiScs(),
      'GET',
      onSuccess,
      () => {
        if (onError) onError();
        setResponse({
          statusMessage: 'Failed to fetch risc scorecards',
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
        });
      },
    );

  const fetchLatestJSONSchema = (
    onSuccess: (response: string) => void,
    onError?: () => void,
  ) =>
    fetch<string>(uriToFetchLatestJSONSchema(), 'GET', onSuccess, () => {
      if (onError) onError();
      setResponse({
        statusMessage:
          'Failed to fetch JSON schema. Fallback value 4.0 for schema version used',
        status: ProcessingStatus.ErrorWhenFetchingJSONSchema,
      });
    });

  const publishRiSc = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: PublishRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<PublishRiScResultDTO>(
        uriToPublishRiSc(riScId),
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        profileInfoToDTOString(profile),
      ),
    );

  const postRiSc = (
    riSc: RiSc,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
        riScUri,
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        riScToDTOString(riSc, true, profile),
      ),
    );

  const putRiSc = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      fetch<ProcessRiScResultDTO>(
        uriToFetchRiSc(riSc.id),
        'PUT',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          if (onError) onError(error);
        },
        riScToDTOString(riSc.content, riSc.isRequiresNewApproval!!, profile),
      ),
    );
  };

  return {
    fetchRiScs: fetchRiScs,
    postRiScs: postRiSc,
    putRiScs: putRiSc,
    publishRiScs: publishRiSc,
    response,
    setResponse,
    fetchLatestJSONSchema,
  };
};

export const useFetchRiScs = (
  riScIdFromParams?: string,
): {
  selectedRiSc: RiScWithMetadata | null;
  riScs: RiScWithMetadata[] | null;
  selectRiSc: (title: string) => void;
  isFetching: boolean;
  createNewRiSc: (riSc: RiSc) => void;
  updateRiSc: (riSc: RiSc) => void;
  updateRiScStatus: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  resetRiScStatus: () => void;
  approveRiSc: () => void;
  response: SubmitResponseObject | null;
  isRequesting: boolean;
} => {
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
  const [updateRiScStatus, setUpdateRiScStatus] = useState({
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
    setUpdateRiScStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const selectRiSc = (title: string) => {
    const riScId = riScs?.find(riSc => riSc.content.title === title)?.id;
    if (riScId) {
      navigate(getRiScPath({ riScId: riScId }));
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

  const updateRiSc = (riSc: RiSc) => {
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

      setUpdateRiScStatus({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });
      setIsRequesting(true);
      putRiScs(
        updatedRiSc,
        () => {
          setUpdateRiScStatus({
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          setSelectedRiSc(updatedRiSc);
          setRiScs(
            riScs.map(r => (r.id === selectedRiSc.id ? updatedRiSc : r)),
          );
          setIsRequesting(false);
        },
        () => {
          setUpdateRiScStatus({
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          setIsRequesting(false);
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

  return {
    selectedRiSc: selectedRiSc,
    riScs: riScs,
    selectRiSc: selectRiSc,
    isFetching,
    updateRiScStatus: updateRiScStatus,
    resetRiScStatus: resetRiScStatus,
    createNewRiSc: createNewRiSc,
    updateRiSc: updateRiSc,
    approveRiSc: approveRiSc,
    response,
    isRequesting: isRequesting,
  };
};
