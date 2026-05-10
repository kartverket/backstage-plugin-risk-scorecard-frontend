import type { Entity } from '@backstage/catalog-model';
import { getCurrentSystemRef } from './entityRefOptions';

describe('getCurrentSystemRef', () => {
  it('uses the current system ref when the current entity is a system', () => {
    expect(getCurrentSystemRef(entity('System', 'system-a'))).toBe(
      'system:default/system-a',
    );
  });

  it('derives the current system from spec.system', () => {
    expect(
      getCurrentSystemRef(
        entityWithSpecSystem('Component', 'current-component', 'system-a'),
      ),
    ).toBe('system:default/system-a');
  });

  it('returns undefined when there is no current system', () => {
    expect(
      getCurrentSystemRef(entity('Resource', 'resource-a')),
    ).toBeUndefined();
  });
});

function entity(kind: string, name: string, namespace = 'default'): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind,
    metadata: {
      name,
      namespace,
    },
  };
}

function entityWithSpecSystem(
  kind: string,
  name: string,
  system: string,
  namespace = 'default',
): Entity {
  return {
    ...entity(kind, name, namespace),
    spec: {
      system,
    },
  };
}
