import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  identityApiRef,
  ProfileInfo,
  useApi,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { BackstageRepo, useBackstageRepo } from '../utils/backstage.ts';

type BackstageContextObject = {
  profileInfo: ProfileInfo | undefined;
  componentType: string | undefined;
  entityRef: string | undefined;
  backstageRepo: BackstageRepo;
  currentEntity: Entity;
  useBackstageRepoOfCurrentEntity: (
    excludeCurrentEntity: boolean,
  ) => BackstageRepo;
};

const BackstageContext = createContext<BackstageContextObject | undefined>(
  undefined,
);

export function BackstageContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const identityApi = useApi(identityApiRef);
  const { entity } = useEntity();

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | undefined>();
  useEffect(() => {
    identityApi
      .getProfileInfo()
      .then(fetchedProfileInfo => setProfileInfo(fetchedProfileInfo));
  }, [identityApi]);

  const componentType = entity.spec?.type as string | undefined;

  const entityRef = stringifyEntityRef({
    kind: entity.kind,
    name: entity.metadata.name,
  });

  const backstageRepo = useBackstageRepo(entity, true);

  const useBackstageRepoOfCurrentEntity = (excludeCurrentEntity: boolean) => {
    return useBackstageRepo(entity, excludeCurrentEntity);
  };

  return (
    <BackstageContext.Provider
      value={{
        profileInfo,
        componentType,
        entityRef,
        backstageRepo,
        currentEntity: entity,
        useBackstageRepoOfCurrentEntity,
      }}
    >
      {children}
    </BackstageContext.Provider>
  );
}

export function useBackstageContext() {
  const context = useContext(BackstageContext);

  if (context === undefined) {
    throw new Error(
      'useBackstageContext must be used within a BackstageContext provider',
    );
  }
  return context;
}
