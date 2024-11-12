import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useState } from 'react';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  DifferenceDTO,
  GenerateInitialRiScBody,
  GithubRepoInfo,
  ProcessingStatus,
  RiSc,
  RiScWithMetadata,
  SubmitResponseObject,
} from './types';
import {
  initialRiScToDTOString,
  ProcessRiScResultDTO,
  profileInfoToDTOString,
  PublishRiScResultDTO,
  RiScContentResultDTO,
  riScToDTOString,
  GenerateInitialRiScDTO,
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
  const gitHubApi = useApi(githubAuthApiRef);
  const identityApi = useApi(identityApiRef);
  const { fetch } = useApi(fetchApiRef);
  const backendUrl = useApi(configApiRef).getString('backend.baseUrl');
  const riScUri = `${backendUrl}/api/proxy/risc-proxy/api/risc/${repoInformation.owner}/${repoInformation.name}`;
  const uriToFetchAllRiScs = `${riScUri}/${latestSupportedVersion}/all`;
  const uriToFetchDifference = (id: string) => `${riScUri}/${id}/difference`;
  const uriToFetchRiSc = (id: string) => `${riScUri}/${id}`;
  const uriToInitializeRiSc = `${riScUri}/initialize`;
  const uriToPublishRiSc = (id: string) => `${riScUri}/publish/${id}`;
  const currentEntity = useEntity();
  const catalogApi = useApi(catalogApiRef);

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
      gitHubApi.getAccessToken(['repo']),
    ]).then(([idToken, googleAccessToken, gitHubAccessToken]) => {
      fetch(uri, {
        method: method,
        headers: {
          Authorization: `Bearer ${idToken.token}`,
          'GCP-Access-Token': googleAccessToken,
          'GitHub-Access-Token': gitHubAccessToken,
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

  const postGenerateInitialRiSc = (
    body: GenerateInitialRiScBody,
    onSuccess?: (response: GenerateInitialRiScDTO) => void,
    onError?: (error: GenerateInitialRiScDTO) => void,
  ) => {
    authenticatedFetch<GenerateInitialRiScDTO, GenerateInitialRiScDTO>(
      uriToInitializeRiSc,
      'POST',
      res => {
        setResponse(res);
        if (onSuccess) onSuccess(res);
      },
      error => {
        if (onError) onError(error);
        setResponse({
          statusMessage: t('errorMessages.ErrorWhenSchedulingInitialRiSc'),
          status: ProcessingStatus.ErrorWhenGeneratingInitialRiSc,
        });
      },
      initialRiScToDTOString(body),
    );
  };

  const fetchAssociatedGcpProjects = async () => {
    switch (currentEntity.entity.kind) {
      case 'Component': {
        const componentSpec = castToType<ComponentSpec>(
          currentEntity.entity.spec,
        );
        const associatedSystem = componentSpec.system;
        if (typeof associatedSystem === 'string') {
          const system = await catalogApi.getEntityByRef({
            name: associatedSystem,
            namespace: 'default',
            kind: 'System',
          });
          const labels = system?.metadata.labels;
          const systemGcpProjectUnfiltered = labels
            ? [labels['gcp-project-id']]
            : [undefined];

          const systemGcpProjects = systemGcpProjectUnfiltered.filter(
            (value): value is string => value !== undefined,
          );
          const associatedGcpProjectsFromOwner =
            await getAssociatedGcpProjectsFromOwner(componentSpec.owner);
          return Array.from(
            new Set([...systemGcpProjects, ...associatedGcpProjectsFromOwner]),
          );
        } else {
          return Array.from(
            new Set(
              await getAssociatedGcpProjectsFromOwner(componentSpec.owner),
            ),
          );
        }
      }
      case 'System': {
        throw Error('Not implemented on system yet');
      }
      default: {
        throw Error(
          'RiSC is not supported on other levels than component and system',
        );
      }
    }
  };

  const getAssociatedGcpProjectsFromOwner = async (ownerName: string) => {
    const entitiesResponse = await catalogApi.getEntities({
      filter: {
        kind: 'System',
        'spec.owner': ownerName,
      },
    });
    const systems = entitiesResponse.items;
    return systems
      .map(system => system.metadata.labels?.['gcp-project-id'])
      .filter((value): value is string => value !== undefined);
  };

  return {
    fetchRiScs,
    postRiScs,
    postGenerateInitialRiSc,
    putRiScs,
    publishRiScs,
    response,
    setResponse,
    fetchDifference,
    fetchAssociatedGcpProjects,
  };
};

interface ComponentSpec {
  owner: string;
  system?: string | null;

  [key: string]: any;
}

function castToType<T>(jsonObject: Record<string, any> | undefined): T {
  if (!jsonObject) {
    throw new Error('Input JSON object is undefined');
  }
  return {
    ...jsonObject,
  } as T;
}
