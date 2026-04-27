import type { DatabaseService } from '@backstage/backend-plugin-api';

const tableName = 'risk_scorecard_risc_index_snapshot';
const snapshotId = 'default';

type DatabaseClient = Awaited<ReturnType<DatabaseService['getClient']>>;
type RiScIndexEntry = {
  sourceUrl: string;
  coversComponentRefs: string[];
};

export interface RiScIndexSnapshotStore {
  readSnapshot(): Promise<RiScIndexEntry[] | undefined>;
  replaceSnapshot(analyses: RiScIndexEntry[]): Promise<void>;
}

export class DatabaseRiScIndexSnapshotStore implements RiScIndexSnapshotStore {
  private readonly clientPromise: Promise<DatabaseClient>;
  private tableReady?: Promise<void>;

  constructor(database: DatabaseService) {
    this.clientPromise = database.getClient();
  }

  async readSnapshot(): Promise<RiScIndexEntry[] | undefined> {
    const client = await this.getClient();
    const row = await client(tableName)
      .select<{ index_json: string }[]>('index_json')
      .where({ id: snapshotId })
      .first();

    if (!row) {
      return undefined;
    }

    return JSON.parse(row.index_json) as RiScIndexEntry[];
  }

  async replaceSnapshot(analyses: RiScIndexEntry[]): Promise<void> {
    const client = await this.getClient();
    const indexJson = JSON.stringify(analyses);

    await client(tableName)
      .insert({
        id: snapshotId,
        index_json: indexJson,
        updated_at: client.fn.now(),
      })
      .onConflict('id')
      .merge({
        index_json: indexJson,
        updated_at: client.fn.now(),
      });
  }

  private async getClient(): Promise<DatabaseClient> {
    const client = await this.clientPromise;
    await this.ensureTable(client);
    return client;
  }

  private async ensureTable(client: DatabaseClient): Promise<void> {
    this.tableReady ??= createTableIfMissing(client);
    await this.tableReady;
  }
}

async function createTableIfMissing(client: DatabaseClient): Promise<void> {
  const tableExists = await client.schema.hasTable(tableName);

  if (tableExists) {
    return;
  }

  try {
    await client.schema.createTable(tableName, table => {
      table.string('id').primary();
      table.text('index_json').notNullable();
      table.timestamp('updated_at').notNullable();
    });
  } catch (error) {
    if (await client.schema.hasTable(tableName)) {
      return;
    }

    throw error;
  }
}
