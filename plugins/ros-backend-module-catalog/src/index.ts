import {
  type AuthService,
  coreServices,
  createBackendModule,
  type DiscoveryService,
  type LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  type RootConfigService,
  type SchedulerService,
  type SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import {
  buildRiskScorecardRiScIndex,
  riScIndexStore,
} from '@kartverket/backstage-plugin-risk-scorecard-backend';
import {
  DatabaseRiScIndexSnapshotStore,
  type RiScIndexSnapshotStore,
} from './riscIndexSnapshotStore';

const defaultSchedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { minutes: 30 },
  timeout: { minutes: 3 },
};
const githubProvidersConfigPath = 'catalog.providers.github';
const taskId = 'risk-scorecard-risc-index-refresh';

export class RiScIndexScheduledRefresh {
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;
  private readonly config: RootConfigService;
  private readonly scheduler: SchedulerService;
  private readonly snapshotStore: RiScIndexSnapshotStore;
  private readonly schedule: SchedulerServiceTaskScheduleDefinition;

  constructor(options: {
    logger: LoggerService;
    discovery: DiscoveryService;
    auth: AuthService;
    config: RootConfigService;
    scheduler: SchedulerService;
    snapshotStore: RiScIndexSnapshotStore;
  }) {
    this.logger = options.logger.child({
      module: 'risk-scorecard-risc-index',
    });
    this.discovery = options.discovery;
    this.auth = options.auth;
    this.config = options.config;
    this.scheduler = options.scheduler;
    this.snapshotStore = options.snapshotStore;

    const githubSchedule = findGitHubProviderScheduleConfig(this.config);
    if (!githubSchedule) {
      this.logger.warn(
        'RiSc index refresh schedule is using the default because no GitHub provider schedule was found',
      );
      this.schedule = defaultSchedule;
    } else {
      this.schedule =
        readSchedulerServiceTaskScheduleDefinitionFromConfig(githubSchedule);
    }
  }

  async start(): Promise<void> {
    const hasPersistedSnapshot = await this.loadPersistedSnapshot();

    this.logger.info('Scheduling RiSc index refresh', {
      taskId,
    });

    await this.scheduler.scheduleTask({
      ...this.schedule,
      id: taskId,
      fn: async () => {
        await this.refreshIndex();
      },
    });

    if (!hasPersistedSnapshot) {
      this.logger.info(
        'Triggering RiSc index refresh because no persisted snapshot was found',
        { taskId },
      );
      await this.scheduler.triggerTask(taskId);
    }
  }

  private async refreshIndex(): Promise<void> {
    this.logger.info('Starting scheduled RiSc index refresh');

    try {
      const riScIndex = await buildRiskScorecardRiScIndex({
        logger: this.logger,
        discovery: this.discovery,
        auth: this.auth,
        config: this.config,
      });
      riScIndexStore.replaceSnapshot(riScIndex);
      await this.snapshotStore.replaceSnapshot(riScIndex);

      this.logger.info('Stored RiSc index snapshot', {
        analysisCount: riScIndex.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to refresh RiSc index', error);
      } else {
        this.logger.error(`Failed to refresh RiSc index: ${String(error)}`);
      }
    }
  }

  private async loadPersistedSnapshot(): Promise<boolean> {
    try {
      const persistedSnapshot = await this.snapshotStore.readSnapshot();

      if (!persistedSnapshot) {
        this.logger.info('No persisted RiSc index snapshot found');
        return false;
      }

      riScIndexStore.replaceSnapshot(persistedSnapshot);

      this.logger.info('Loaded persisted RiSc index snapshot', {
        analysisCount: persistedSnapshot.length,
      });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to load persisted RiSc index snapshot', error);
      } else {
        this.logger.error(
          `Failed to load persisted RiSc index snapshot: ${String(error)}`,
        );
      }
      return false;
    }
  }
}

function findGitHubProviderScheduleConfig(
  config: RootConfigService,
): RootConfigService | undefined {
  const githubProvidersConfig = config.getOptionalConfig(
    githubProvidersConfigPath,
  );

  if (!githubProvidersConfig) {
    return undefined;
  }

  for (const providerId of githubProvidersConfig.keys()) {
    const schedulePath = `${providerId}.schedule`;
    const scheduleConfig = githubProvidersConfig.getOptionalConfig(schedulePath);

    if (scheduleConfig) {
      return scheduleConfig as RootConfigService;
    }
  }

  return undefined;
}

const riskScorecardCatalogModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'risk-scorecard-risc-index',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        database: coreServices.database,
      },
      async init({ logger, discovery, auth, config, scheduler, database }) {
        const refresher = new RiScIndexScheduledRefresh({
          logger,
          discovery,
          auth,
          config,
          scheduler,
          snapshotStore: new DatabaseRiScIndexSnapshotStore(database),
        });

        await refresher.start();
      },
    });
  },
});

export default riskScorecardCatalogModule;
