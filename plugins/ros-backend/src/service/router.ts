import type { AuthService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import {
  parseEntityRef,
  RELATION_PART_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import express from 'express';
import type { RiScIndexEntry, RiScIndexStore } from './riscIndexStore';

type RouterOptions = {
  catalogClient: CatalogApi;
  auth: AuthService;
  riScIndexStore: RiScIndexStore;
};

export const createRouter = async (
  options: RouterOptions,
): Promise<express.Router> => {
  const router = express.Router();

  router.get('/riscs', async (req, res, next) => {
    const entityRef = req.query.entityRef;

    if (typeof entityRef !== 'string' || entityRef.trim() === '') {
      res.status(400).json({
        error: 'Query parameter "entityRef" is required',
      });
      return;
    }

    try {
      res.json(await getRiScsForEntityRef(entityRef.trim(), options));
    } catch (error) {
      next(error);
    }
  });

  return router;
};

async function getRiScsForEntityRef(
  entityRef: string,
  options: RouterOptions,
): Promise<readonly RiScIndexEntry[]> {
  const directMatches = options.riScIndexStore.getRiScsForEntityRef(entityRef);

  if (!isSystemEntityRef(entityRef)) {
    return directMatches;
  }

  const componentRefs = await getComponentRefsForSystemEntityRef(
    entityRef,
    options.catalogClient,
    options.auth,
  );

  return deduplicateRiScIndexReferences([
    ...directMatches,
    ...componentRefs.flatMap(componentRef =>
      options.riScIndexStore.getRiScsForEntityRef(componentRef),
    ),
  ]);
}

async function getComponentRefsForSystemEntityRef(
  systemEntityRef: string,
  catalogClient: CatalogApi,
  auth: AuthService,
): Promise<string[]> {
  const catalogToken = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });

  const response = await catalogClient.getEntities(
    {
      filter: {
        kind: 'Component',
        [`relations.${RELATION_PART_OF}`]: systemEntityRef,
      },
      fields: ['kind', 'metadata.name', 'metadata.namespace'],
    },
    { token: catalogToken.token },
  );

  return response.items.map(stringifyEntityRef);
}

function isSystemEntityRef(entityRef: string): boolean {
  const parsedEntityRef = parseEntityRef(entityRef);

  return parsedEntityRef.kind.toLowerCase() === 'system'
}

function deduplicateRiScIndexReferences(
  references: RiScIndexEntry[],
): readonly RiScIndexEntry[] {
  const referencesByKey = new Map<string, RiScIndexEntry>();

  for (const reference of references) {
    referencesByKey.set(`${reference.sourceEntityRef}:${reference.riScId}`, reference);
  }

  return Object.freeze([...referencesByKey.values()]);
}
