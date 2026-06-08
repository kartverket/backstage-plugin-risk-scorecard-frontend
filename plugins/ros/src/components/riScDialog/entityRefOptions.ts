import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import type { Entity } from '@backstage/catalog-model';

export const entityRefOptionFields = [
  'kind',
  'metadata.name',
  'metadata.namespace',
  'metadata.title',
];

export function getCurrentSystemRef(entity: Entity): string | undefined {
  if (entity.kind === 'System') {
    return stringifyEntityRef(entity);
  }

  const specSystem = entity.spec?.system;
  if (typeof specSystem !== 'string' || specSystem.trim() === '') {
    return undefined;
  }

  return stringifyEntityRef(
    parseEntityRef(specSystem, {
      defaultKind: 'System',
      defaultNamespace: entity.metadata.namespace ?? 'default',
    }),
  );
}
