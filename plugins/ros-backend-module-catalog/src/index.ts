import {
  type AuthService,
  coreServices,
  createBackendModule,
  type DiscoveryService,
  type LoggerService,
} from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import {
  catalogProcessingExtensionPoint,
  type CatalogProcessor,
} from '@backstage/plugin-catalog-node';
import {
  buildRiskScorecardRiScIndex,
  riScIndexStore,
} from '@kartverket/backstage-plugin-risk-scorecard-backend';

const riskScorecardCatalogModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'risk-scorecard-risc-index',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
      },
      async init({ catalog, logger, discovery, auth, config }) {
        catalog.addProcessor(
          new RiScIndexRefreshProcessor({
            logger,
            discovery,
            auth,
            config,
          }),
        );
      },
    });
  },
});

class RiScIndexRefreshProcessor implements CatalogProcessor {
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private refreshInFlight: Promise<void> | undefined;
  private refreshQueued = false;
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;
  private readonly config: { getOptionalString?(key: string): string | undefined };

  constructor(options: {
    logger: LoggerService;
    discovery: DiscoveryService;
    auth: AuthService;
    config: { getOptionalString?(key: string): string | undefined };
  }) {
    this.logger = options.logger.child({
      module: 'risk-scorecard-risc-index',
    });
    this.discovery = options.discovery;
    this.auth = options.auth;
    this.config = options.config;
  }

  getProcessorName(): string {
    return 'RiScIndexRefreshProcessor';
  }

  async postProcessEntity(entity: Entity): Promise<Entity> {
    if (entity.kind.toLocaleLowerCase('en-US') === 'component') {
      this.scheduleRefresh();
    }

    return entity;
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = undefined;
      void this.runRefresh();
    }, 1000);
  }

  private async runRefresh(): Promise<void> {
    if (this.refreshInFlight) {
      this.refreshQueued = true;
      return;
    }

    this.refreshInFlight = this.refreshIndex().finally(() => {
      this.refreshInFlight = undefined;

      if (this.refreshQueued) {
        this.refreshQueued = false;
        this.scheduleRefresh();
      }
    });

    await this.refreshInFlight;
  }

  private async refreshIndex(): Promise<void> {
    try {
      const riScIndex = await buildRiskScorecardRiScIndex({
        logger: this.logger,
        discovery: this.discovery,
        auth: this.auth,
        config: this.config,
      });
      riScIndexStore.replaceSnapshot(riScIndex);

      this.logger.info('Stored RiSc index snapshot');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to build RiSc index', error);
      } else {
        this.logger.error(`Failed to build RiSc index: ${String(error)}`);
      }
    }
  }
}

export default riskScorecardCatalogModule;
