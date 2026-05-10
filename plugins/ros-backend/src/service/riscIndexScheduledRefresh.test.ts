/**
 * @jest-environment node
 */

import type {
  AuthService,
  DiscoveryService,
  LoggerService,
  RootConfigService,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import { buildRiskScorecardRiScIndex } from './riscIndex';
import { RiScIndexScheduledRefresh } from './riscIndexScheduledRefresh';
import type { RiScIndexStore } from './riscIndexStore';
import type { RiScIndexSnapshotStore } from './riscIndexSnapshotStore';

jest.mock('./riscIndex', () => ({
  buildRiskScorecardRiScIndex: jest.fn(),
}));

describe('RiScIndexScheduledRefresh', () => {
  const buildIndexMock = jest.mocked(buildRiskScorecardRiScIndex);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules the refresh with the RiSc index schedule config', async () => {
    const scheduler = createScheduler();

    await createRefresh({ scheduler }).start();

    expect(scheduler.scheduleTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'risk-scorecard-risc-index-refresh',
        frequency: { cron: '0 0 * * *' },
        timeout: { minutes: 1 },
      }),
    );
  });

  it('refreshes and stores the index when the scheduled task runs', async () => {
    const scheduler = createScheduler();
    const riScIndexStore = createRiScIndexStore();
    const snapshotStore = createSnapshotStore();
    const index = [
      {
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesTo: ['component:default/kv-ros-test-1'],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ];
    buildIndexMock.mockResolvedValue(index);

    await createRefresh({ scheduler, riScIndexStore, snapshotStore }).start();

    const scheduledTask = jest.mocked(scheduler.scheduleTask).mock.calls[0][0];
    await scheduledTask.fn(new AbortController().signal);

    expect(buildIndexMock).toHaveBeenCalledTimes(1);
    expect(riScIndexStore.replaceSnapshot).toHaveBeenCalledWith(index);
    expect(snapshotStore.replaceSnapshot).toHaveBeenCalledWith(index);
  });

  it('loads a persisted snapshot on startup', async () => {
    const scheduler = createScheduler();
    const riScIndexStore = createRiScIndexStore();
    const snapshotStore = createSnapshotStore();
    const persistedSnapshot = [
      {
        riScId: 'risc-1',
        sourceEntityRef: 'component:default/source-1',
        appliesTo: ['component:default/kv-ros-test-1'],
        lastSavedAt: '2026-05-01T08:30:00Z',
      },
    ];
    jest
      .mocked(snapshotStore.readSnapshot)
      .mockResolvedValue(persistedSnapshot);

    await createRefresh({ scheduler, riScIndexStore, snapshotStore }).start();

    expect(riScIndexStore.replaceSnapshot).toHaveBeenCalledWith(
      persistedSnapshot,
    );
    expect(scheduler.triggerTask).not.toHaveBeenCalled();
  });

  it('triggers the scheduled task when no persisted snapshot exists', async () => {
    const scheduler = createScheduler();

    await createRefresh({ scheduler }).start();

    expect(scheduler.triggerTask).toHaveBeenCalledWith(
      'risk-scorecard-risc-index-refresh',
    );
  });

  it('falls back to the default schedule when no RiSc index schedule exists', async () => {
    const scheduler = createScheduler();
    const logger = createLogger();

    await createRefresh({
      scheduler,
      logger,
      config: createConfig({
        catalog: {
          providers: {
            github: {
              first: {
                schedule: {
                  frequency: { minutes: 5 },
                  timeout: { minutes: 1 },
                },
              },
            },
          },
        },
      }),
    }).start();

    expect(scheduler.scheduleTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'risk-scorecard-risc-index-refresh',
        frequency: { cron: '0 0 * * *' },
        timeout: { minutes: 30 },
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'RiSc index refresh schedule is using the default because no riskScorecard.riscIndex.schedule config was found',
    );
  });
});

function createRefresh({
  logger = createLogger(),
  scheduler = createScheduler(),
  config = createConfig({
    riskScorecard: {
      riscIndex: {
        schedule: {
          frequency: { cron: '0 0 * * *' },
          timeout: { minutes: 1 },
        },
      },
    },
  }),
  riScIndexStore = createRiScIndexStore(),
  snapshotStore = createSnapshotStore(),
}: {
  logger?: LoggerService;
  scheduler?: SchedulerService;
  config?: RootConfigService;
  riScIndexStore?: RiScIndexStore;
  snapshotStore?: RiScIndexSnapshotStore;
} = {}): RiScIndexScheduledRefresh {
  return new RiScIndexScheduledRefresh({
    logger,
    discovery: {} as DiscoveryService,
    auth: {} as AuthService,
    config,
    scheduler,
    riScIndexStore,
    snapshotStore,
  });
}

function createScheduler(): SchedulerService {
  return {
    scheduleTask: jest.fn().mockResolvedValue(undefined),
    triggerTask: jest.fn().mockResolvedValue(undefined),
    createScheduledTaskRunner: jest.fn(),
    getScheduledTasks: jest.fn(),
  } as unknown as SchedulerService;
}

function createSnapshotStore(): RiScIndexSnapshotStore {
  return {
    readSnapshot: jest.fn().mockResolvedValue(undefined),
    replaceSnapshot: jest.fn().mockResolvedValue(undefined),
  };
}

function createRiScIndexStore(): RiScIndexStore {
  return {
    replaceSnapshot: jest.fn(),
    getRiScsForEntityRef: jest.fn(),
  };
}

function createLogger(): LoggerService {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  } as unknown as LoggerService;

  jest.mocked(logger.child).mockReturnValue(logger);

  return logger;
}

function createConfig(data: Record<string, unknown>): RootConfigService {
  return {
    has(key: string) {
      return getConfigValue(data, key) !== undefined;
    },
    keys() {
      return Object.keys(data);
    },
    get<T = unknown>(key?: string): T {
      const value = getConfigValue(data, key);
      if (value === undefined) {
        throw new Error(`Missing config value for key "${key ?? ''}"`);
      }
      return value as T;
    },
    getOptional<T = unknown>(key?: string): T | undefined {
      return getConfigValue(data, key) as T | undefined;
    },
    getConfig(key: string) {
      const value = getConfigValue(data, key);
      if (!isConfigObject(value)) {
        throw new Error(`Missing config object for key "${key}"`);
      }
      return createConfig(value);
    },
    getOptionalConfig(key: string) {
      const value = getConfigValue(data, key);
      return isConfigObject(value) ? createConfig(value) : undefined;
    },
    getConfigArray() {
      throw new Error('Not implemented in test config');
    },
    getOptionalConfigArray() {
      return undefined;
    },
    getNumber(key: string) {
      const value = getConfigValue(data, key);
      if (typeof value !== 'number') {
        throw new Error(`Missing numeric config value for key "${key}"`);
      }
      return value;
    },
    getOptionalNumber(key: string) {
      const value = getConfigValue(data, key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean(key: string) {
      const value = getConfigValue(data, key);
      if (typeof value !== 'boolean') {
        throw new Error(`Missing boolean config value for key "${key}"`);
      }
      return value;
    },
    getOptionalBoolean(key: string) {
      const value = getConfigValue(data, key);
      return typeof value === 'boolean' ? value : undefined;
    },
    getString(key: string) {
      const value = getConfigValue(data, key);
      if (typeof value !== 'string') {
        throw new Error(`Missing string config value for key "${key}"`);
      }
      return value;
    },
    getOptionalString(key: string) {
      const value = getConfigValue(data, key);
      return typeof value === 'string' ? value : undefined;
    },
    getStringArray(key: string) {
      const value = getConfigValue(data, key);
      if (
        !Array.isArray(value) ||
        !value.every(entry => typeof entry === 'string')
      ) {
        throw new Error(`Missing string array config value for key "${key}"`);
      }
      return value;
    },
    getOptionalStringArray(key: string) {
      const value = getConfigValue(data, key);
      return Array.isArray(value) &&
        value.every(entry => typeof entry === 'string')
        ? value
        : undefined;
    },
  } as unknown as RootConfigService;
}

function getConfigValue(data: Record<string, unknown>, key?: string): unknown {
  if (!key) {
    return data;
  }

  return key.split('.').reduce<unknown>((current, part) => {
    if (!isConfigObject(current) || !(part in current)) {
      return undefined;
    }

    return current[part];
  }, data);
}

function isConfigObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
