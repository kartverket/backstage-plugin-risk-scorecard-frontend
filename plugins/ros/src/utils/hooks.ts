import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  DifferenceDTO,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import {
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
  GenerateRiScDTO,
  generateRiScToDTOString,
} from './DTOs';
import { latestSupportedVersion } from './constants';
import { pluginRiScTranslationRef } from './translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

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

export const useAuthenticatedFetch = () => {
  const repoInformation = useGithubRepositoryInformation();
  const googleApi = useApi(googleAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = `${riScUri}/${latestSupportedVersion}/all`;
  const uriToFetchDifference = (id: string) => `${riScUri}/${id}/difference`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const uriToGenerateRiSc = `${riScUri}/initialize`;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const useResponse = (): [
    SubmitResponseObject | null,
    (submitStatus: SubmitResponseObject | null) => void,
  ] => {
    const [submitResponse, setSubmitResponse] =
      useState<SubmitResponseObject | null>(null);

    // use callback to avoid infinite loop
    const displaySubmitResponse = useCallback(
      (submitStatus: SubmitResponseObject | null) => {
        setSubmitResponse(submitStatus);
        setTimeout(() => {
          setSubmitResponse(null);
        }, 10000);
      },
      [],
    );

    return [submitResponse, displaySubmitResponse];
  };

  const [response, setResponse] = useResponse();

  const authenticatedFetch = <T, K>(
    uri: string,
    method: 'GET' | 'POST' | 'PUT',
    onSuccess: (response: T) => void,
    onError: (error: K) => void,
    body?: string,
  ) => {
    Promise.all([
      identityApi.getCredentials(),
      googleApi.getAccessToken(['https://www.googleapis.com/auth/cloudkms']),
    ]).then(([idToken, googleAccessToken]) => {
      fetch(uri, {
        method: method,
        headers: {
          Authorization: `Bearer ${idToken.token}`,
          'GCP-Access-Token': googleAccessToken,
          'Content-Type': 'application/json',
        },
        body: body,
      }).then(res => {
        if (!res.ok) {
          return res
            .json()
            .then(json => json as K)
            .then(typedJson => onError(typedJson))
            .catch(error => onError(error));
        }
        return res
          .json()
          .then(json => json as T)
          .then(typedJson => onSuccess(typedJson));
      });
    });
  };

  const fetchDifference = (
    selectedRiSc: RiScWithMetadata,
    onSuccess: (response: DifferenceDTO) => void,
    onError?: () => void,
  ) =>
    identityApi.getProfileInfo().then(profile => {
      authenticatedFetch<DifferenceDTO, DifferenceDTO>(
        uriToFetchDifference(selectedRiSc.id),
        'POST',
        onSuccess,
        () => {
          if (onError) onError();
        },
        riScToDTOString(selectedRiSc.content, false, profile),
      );
    });

  const fetchRiScs = (
    onSuccess: (response: RiScContentResultDTO[]) => void,
    onError?: () => void,
  ) =>
    authenticatedFetch<RiScContentResultDTO[], RiScContentResultDTO[]>(
      uriToFetchAllRiScs,
      'GET',
      onSuccess,
      () => {
        if (onError) onError();
        setResponse({
          statusMessage: t('errorMessages.FailedToFetchRiScs'),
          status: ProcessingStatus.ErrorWhenFetchingRiScs,
        });
      },
    );

  const publishRiScs = (
    riScId: string,
    onSuccess?: (response: PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<PublishRiScResultDTO, ProcessRiScResultDTO>(
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

  const postRiScs = (
    riSc: RiSc,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) =>
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<ProcessRiScResultDTO, ProcessRiScResultDTO>(
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

  const putRiScs = (
    riSc: RiScWithMetadata,
    onSuccess?: (response: ProcessRiScResultDTO | PublishRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(profile =>
      authenticatedFetch<
        ProcessRiScResultDTO | PublishRiScResultDTO,
        ProcessRiScResultDTO
      >(
        uriToFetchRiSc(riSc.id),
        'PUT',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        riScToDTOString(riSc.content, riSc.isRequiresNewApproval!!, profile),
      ),
    );
  };

  const generateRiSc = (
    generateRiScDTO: GenerateRiScDTO,
    onSuccess?: (response: ProcessRiScResultDTO) => void,
    onError?: (error: ProcessRiScResultDTO) => void,
  ) => {
    identityApi.getProfileInfo().then(() =>
      authenticatedFetch<ProcessRiScResultDTO, ProcessRiScResultDTO>(
        uriToGenerateRiSc,
        'POST',
        res => {
          setResponse(res);
          if (onSuccess) onSuccess(res);
        },
        error => {
          setResponse(error);
          if (onError) onError(error);
        },
        generateRiScToDTOString(generateRiScDTO),
      ),
    );
  };

  const fetchProjectIds = async (): Promise<string[]> => {
    try {
      // Step 1: Fetch the component entity by its name
      const entity = await catalogApi.getEntityByRef(
        `component:${repoInformation.name}`,
      );

      // Step 2: Check if the component has 'gcp-project-id' in metadata.labels
      if (
        entity?.metadata?.labels &&
        entity.metadata.labels['gcp-project-id']
      ) {
        return entity.metadata.labels['gcp-project-id'].split(',');
      }

      // Step 3: If no labels, check for the 'ownerOf' systems
      const ownerOfSystems = entity?.relations?.filter(
        rel => rel.type === 'ownerOf' && rel.targetRef.startsWith('system:'),
      );

      if (ownerOfSystems && ownerOfSystems.length > 0) {
        for (const system of ownerOfSystems) {
          const systemEntity = await catalogApi.getEntityByRef(
            system.targetRef,
          );

          // Step 4: Check if the system entity has 'gcp-project-id' in metadata.labels
          if (
            systemEntity?.metadata?.labels &&
            systemEntity.metadata.labels['gcp-project-id']
          ) {
            return systemEntity.metadata.labels['gcp-project-id'].split(',');
          }
        }
      }

      // Step 5: If no project IDs are found, return default project IDs
      return ['1234567890', '0987654321']; // Default project IDs
    } catch (error) {
      console.error('Error fetching project IDs:', error);
      return [];
    }
  };

  return {
    fetchRiScs,
    postRiScs,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    fetchDifference,
    generateRiSc,
    fetchProjectIds,
  };
};
