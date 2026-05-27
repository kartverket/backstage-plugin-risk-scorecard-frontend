import {
  type AuthService,
  type DiscoveryService,
  type LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  type RootConfigService,
  type SchedulerService,
  type SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { buildRiskScorecardRiScIndex } from './riscIndex';
import type { RiScIndexEntry, RiScIndexStore } from './riscIndexStore';

const defaultSchedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { cron: '0 0 * * *' },
  timeout: { minutes: 30 },
};
const riscIndexScheduleConfigPath = 'riskScorecard.riscIndex.schedule';
const taskId = 'risk-scorecard-risc-index-refresh';

export class RiScIndexScheduledRefresh {
  private readonly logger: LoggerService;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;
  private readonly config: RootConfigService;
  private readonly scheduler: SchedulerService;
  private readonly riScIndexStore: RiScIndexStore;
  private readonly schedule: SchedulerServiceTaskScheduleDefinition;

  constructor(options: {
    logger: LoggerService;
    discovery: DiscoveryService;
    auth: AuthService;
    config: RootConfigService;
    scheduler: SchedulerService;
    riScIndexStore: RiScIndexStore;
  }) {
    this.logger = options.logger.child({
      module: 'risk-scorecard-risc-index',
    });
    this.discovery = options.discovery;
    this.auth = options.auth;
    this.config = options.config;
    this.scheduler = options.scheduler;
    this.riScIndexStore = options.riScIndexStore;

    const scheduleConfig = this.config.getOptionalConfig(
      riscIndexScheduleConfigPath,
    );
    if (!scheduleConfig) {
      this.logger.info(
        `RiSc index refresh schedule is using the default because no ${riscIndexScheduleConfigPath} config was found`,
      );
      this.schedule = defaultSchedule;
    } else {
      this.schedule =
        readSchedulerServiceTaskScheduleDefinitionFromConfig(scheduleConfig);
    }
  }

  async start(): Promise<void> {
    const hasPersistedIndex = await this.hasPersistedIndex();

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

    if (!hasPersistedIndex) {
      this.logger.info(
        'Triggering RiSc index refresh because no persisted index was found',
        { taskId },
      );
      await this.scheduler.triggerTask(taskId);
    }
  }

  private async refreshIndex(): Promise<void> {
    this.logger.info('Starting scheduled RiSc index refresh');

    try {
      const previousIndex = await this.getPreviousIndex();
      const riScIndex = await buildRiskScorecardRiScIndex({
        logger: this.logger,
        discovery: this.discovery,
        auth: this.auth,
        config: this.config,
        previousIndex,
      });
      await this.riScIndexStore.replaceIndex(riScIndex);

      this.logger.info('Stored RiSc index', {
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

  private async hasPersistedIndex(): Promise<boolean> {
    try {
      return await this.riScIndexStore.hasEntries();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to inspect persisted RiSc index', error);
      } else {
        this.logger.error(
          `Failed to inspect persisted RiSc index: ${String(error)}`,
        );
      }
      return false;
    }
  }

  private async getPreviousIndex(): Promise<readonly RiScIndexEntry[]> {
    try {
      return await this.riScIndexStore.getAllRiScs();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to load previous RiSc index', error);
      } else {
        this.logger.error(
          `Failed to load previous RiSc index: ${String(error)}`,
        );
      }
      return [];
    }
  }
}
