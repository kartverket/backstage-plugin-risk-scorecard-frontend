import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import { useRiScs } from '../contexts/RiScContext.tsx';

export type BackstageRepo = {
  repoUrl: string;
  entitiesOfRepo: Entity[];
};

/** Gets the repository URL and all entities of the repo where the currentEntity parameter is stored. */
export function useBackstageRepo(
  currentEntity: Entity,
  excludeCurrentEntity: boolean = false,
): BackstageRepo {
  const [entities, setEntities] = useState<Entity[]>();
  const catalogApi = useApi(catalogApiRef);
  const repoUrl: string | null | undefined = currentEntity.metadata
    ?.annotations?.['backstage.io/managed-by-location'] as
    | string
    | null
    | undefined;

  useEffect(() => {
    // fetches component and system entities of backstage within same repo as current entity
    const fetchEntities = async () => {
      if (!repoUrl) return;
      const fetchedEntities = await catalogApi.getEntities({
        filter: {
          kind: ['Component', 'System'],
          'metadata.annotations.backstage.io/managed-by-location': repoUrl,
        },
      });
      setEntities(fetchedEntities.items);
    };
    fetchEntities();
  }, [repoUrl, catalogApi]);

  // sorting entities. systems appears before components
  let sortedAndFilteredEntities = (entities ?? []).sort((a, b) => {
    const aLower = a.kind.toLowerCase();
    const bLower = b.kind.toLowerCase();
    if (aLower === 'system' && bLower !== 'system') return -1;
    if (aLower === 'system' && bLower === 'system') return 0;
    return 1;
  });

  // filtering entities. removes current entity based on excludeCurrentEntity
  const curEntityRef = stringifyEntityRef(currentEntity);
  if (excludeCurrentEntity) {
    sortedAndFilteredEntities = sortedAndFilteredEntities.filter(e => {
      const entityRef = stringifyEntityRef(e);
      return entityRef !== curEntityRef;
    });
  }

  return {
    repoUrl: repoUrl ?? '',
    entitiesOfRepo: sortedAndFilteredEntities ?? [],
  };
}

/** Returns the url to the selected RiSc in the context of the entity parameter. */
export function useEntityUrl(entity: Entity) {
  const { selectedRiSc } = useRiScs();
  return `${window.location.origin}/catalog/${entity.metadata.namespace ?? 'default'}/${entity.kind.toLowerCase()}/${entity.metadata.name}/risc/${selectedRiSc?.id ?? ''}`;
}
