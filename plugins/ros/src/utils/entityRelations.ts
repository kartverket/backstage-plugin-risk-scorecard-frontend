import { useEntity } from '@backstage/plugin-catalog-react';

export interface ComponentRelation {
  name: string;
  namespace?: string;
  kind: string;
  relationType: string;
  entityRef: string;
  riscUrl: string;
}

/**
 * Extract component relations from an entity's relations array.
 * Filters for relations where the target kind is 'Component'.
 *
 * @returns Array of component relations with name, namespace, kind, and relation type
 */
export function useSystemChildComponents(): ComponentRelation[] {
  const { entity } = useEntity();

  if (entity.kind?.toLowerCase() !== 'system') {
    return [];
  }

  if (!entity.relations || entity.relations.length === 0) {
    return [];
  }

  return entity.relations
    .filter(relation => relation.targetRef.includes('component:'))
    .map(relation => {
      const parts = relation.targetRef.split(':');
      const kind = parts.length === 2 ? parts[0] : 'component';
      const rest = parts.length === 2 ? parts[1] : parts[0];

      const namespaceParts = rest.split('/');
      const namespace =
        namespaceParts.length === 2 ? namespaceParts[0] : 'default';
      const name =
        namespaceParts.length === 2 ? namespaceParts[1] : namespaceParts[0];

      return {
        name,
        namespace,
        kind,
        relationType: relation.type,
        entityRef: `${kind}:${namespace}/${name}`,
        riscUrl: `/catalog/${namespace}/${kind}/${name}/risc`,
      };
    });
}
