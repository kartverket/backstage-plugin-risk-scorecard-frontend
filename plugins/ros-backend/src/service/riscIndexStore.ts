import type { DatabaseService } from '@backstage/backend-plugin-api';

export type RiScIndexEntryRef = {
  sourceFilePath: string;
};

export type RiScIndexEntry = RiScIndexEntryRef & {
  riScId: string;
  appliesTo: string[];
  lastSavedAt: string;
};

const indexTableName = 'risk_scorecard_risc_index';
const entityIndexTableName = 'risk_scorecard_risc_index_entity';

type DatabaseClient = Awaited<ReturnType<DatabaseService['getClient']>>;
type DatabaseTransaction = Parameters<
  Parameters<DatabaseClient['transaction']>[0]
>[0];
type QueryableDatabase = DatabaseClient | DatabaseTransaction;

export type RiScIndexStore = {
  hasEntries(): Promise<boolean>;
  getAllRiScs(): Promise<readonly RiScIndexEntry[]>;
  replaceIndex(analyses: RiScIndexEntry[]): Promise<void>;
  upsertEntry(analysis: RiScIndexEntry): Promise<void>;
  deleteEntry(sourceFilePath: string): Promise<void>;
  getRiScsForEntityRef(entityRef: string): Promise<readonly RiScIndexEntry[]>;
};

type RiScIndexRow = {
  source_file_path: string;
  risc_id: string;
  applies_to_json: string;
  last_saved_at: string;
};

type RiScIndexInsertRow = RiScIndexRow & {
  updated_at: unknown;
};

type RiScEntityIndexRow = {
  entity_ref: string;
  source_file_path: string;
};

export class DatabaseRiScIndexStore implements RiScIndexStore {
  private readonly clientPromise: Promise<DatabaseClient>;
  private tablesReady?: Promise<void>;

  constructor(database: DatabaseService) {
    this.clientPromise = database.getClient();
  }

  async hasEntries(): Promise<boolean> {
    const client = await this.getClient();
    const row = await client(indexTableName)
      .select('source_file_path')
      .first();

    return Boolean(row);
  }

  async getAllRiScs(): Promise<readonly RiScIndexEntry[]> {
    const client = await this.getClient();
    const rows = await client(indexTableName)
      .select<RiScIndexRow[]>([
        'source_file_path',
        'risc_id',
        'applies_to_json',
        'last_saved_at',
      ])
      .orderBy([
        { column: 'source_file_path', order: 'asc' },
      ]);

    return Object.freeze(rows.map(rowToRiScIndexEntry));
  }

  async replaceIndex(analyses: RiScIndexEntry[]): Promise<void> {
    const client = await this.getClient();
    const entries = deduplicateEntries(analyses);

    await client.transaction(async tx => {
      await tx(entityIndexTableName).delete();

      await tx(indexTableName).delete();
      await insertEntries(tx, entries);
    });
  }

  // TODO: Note - This is not to be used in this branch, but to show how updates will work in the future
  async upsertEntry(analysis: RiScIndexEntry): Promise<void> {
    const client = await this.getClient();
    const [entry] = deduplicateEntries([analysis]);

    if (!entry) {
      return;
    }

    await client.transaction(async tx => {
      await upsertIndexEntry(tx, entry);
      await deleteEntityRefs(tx, entry);
      await insertEntityRefs(tx, [entry]);
    });
  }

  async deleteEntry(sourceFilePath: string): Promise<void> {
    const client = await this.getClient();

    await client.transaction(async tx => {
      await deleteEntityRefs(tx, { sourceFilePath });
      await tx(indexTableName)
        .where({
          source_file_path: sourceFilePath,
        })
        .delete();
    });
  }

  async getRiScsForEntityRef(
    entityRef: string,
  ): Promise<readonly RiScIndexEntry[]> {
    const client = await this.getClient();
    const rows = await client(`${entityIndexTableName} as entity_index`)
      .join(`${indexTableName} as risc_index`, function joinIndexEntry() {
        this.on(
          'entity_index.source_file_path',
          '=',
          'risc_index.source_file_path',
        );
      })
      .select<RiScIndexRow[]>([
        'risc_index.source_file_path',
        'risc_index.risc_id',
        'risc_index.applies_to_json',
        'risc_index.last_saved_at',
      ])
      .where('entity_index.entity_ref', entityRef)
      .orderBy([
        { column: 'risc_index.source_file_path', order: 'asc' },
      ]);

    return Object.freeze(rows.map(rowToRiScIndexEntry));
  }

  private async getClient(): Promise<DatabaseClient> {
    const client = await this.clientPromise;
    await this.ensureTables(client);
    return client;
  }

  private async ensureTables(client: DatabaseClient): Promise<void> {
    this.tablesReady ??= createTablesIfMissing(client);
    await this.tablesReady;
  }
}

function deduplicateEntries(analyses: RiScIndexEntry[]): RiScIndexEntry[] {
  const entriesByKey = new Map<string, RiScIndexEntry>();

  for (const analysis of analyses) {
    entriesByKey.set(getEntryKey(analysis), {
      ...analysis,
      appliesTo: [...new Set(analysis.appliesTo)],
    });
  }

  return [...entriesByKey.values()];
}

async function createTablesIfMissing(client: DatabaseClient): Promise<void> {
  // If any changes to these tables require migrations in the future, it is suggested to instead
  //  create new ones, wait for them to be populated, and then fix the functionality in a new change.

  await createTableIfMissing(client, indexTableName, table => {
    table.string('source_file_path', 1024).notNullable();
    table.string('risc_id').notNullable();
    table.text('applies_to_json').notNullable();
    table.string('last_saved_at').notNullable();
    table.timestamp('updated_at').notNullable();
    table.primary(['source_file_path']);
  });

  await createTableIfMissing(client, entityIndexTableName, table => {
    table.string('entity_ref').notNullable();
    table.string('source_file_path', 1024).notNullable();
    table.primary(['entity_ref', 'source_file_path']);
    table.index(
      ['source_file_path'],
      'risk_scorecard_risc_index_entity_source_path_idx',
    );
  });
}

async function createTableIfMissing(
  client: DatabaseClient,
  tableName: string,
  createTable: Parameters<DatabaseClient['schema']['createTable']>[1],
): Promise<void> {
  const tableExists = await client.schema.hasTable(tableName);

  if (tableExists) {
    return;
  }

  try {
    await client.schema.createTable(tableName, createTable);
  } catch (error) {
    if (await client.schema.hasTable(tableName)) {
      return;
    }

    throw error;
  }
}

async function insertEntries(
  client: QueryableDatabase,
  entries: RiScIndexEntry[],
): Promise<void> {
  if (entries.length === 0) {
    return;
  }

  await insertIndexEntries(client, entries);
  await insertEntityRefs(client, entries);
}

async function insertIndexEntries(
  client: QueryableDatabase,
  entries: RiScIndexEntry[],
): Promise<void> {
  const rows = entries.map(entry => toRiScIndexRow(client, entry));

  for (const chunk of chunkArray(rows, 100)) {
    await client(indexTableName).insert(chunk);
  }
}

async function upsertIndexEntry(
  client: QueryableDatabase,
  entry: RiScIndexEntry,
): Promise<void> {
  const row = toRiScIndexRow(client, entry);

  await client(indexTableName)
    .insert(row)
    .onConflict(['source_file_path'])
    .merge({
      risc_id: row.risc_id,
      applies_to_json: row.applies_to_json,
      last_saved_at: row.last_saved_at,
      updated_at: client.fn.now(),
    });
}

async function insertEntityRefs(
  client: QueryableDatabase,
  entries: RiScIndexEntry[],
): Promise<void> {
  const rows = entries.flatMap(toRiScEntityIndexRows);

  if (rows.length === 0) {
    return;
  }

  for (const chunk of chunkArray(rows, 100)) {
    await client(entityIndexTableName)
      .insert(chunk)
      .onConflict(['entity_ref', 'source_file_path'])
      .ignore();
  }
}

async function deleteEntityRefs(
  client: QueryableDatabase,
  entry: RiScIndexEntryRef,
): Promise<void> {
  await client(entityIndexTableName)
    .where({
      source_file_path: entry.sourceFilePath,
    })
    .delete();
}

function toRiScIndexRow(
  client: QueryableDatabase,
  entry: RiScIndexEntry,
): RiScIndexInsertRow {
  return {
    source_file_path: entry.sourceFilePath,
    risc_id: entry.riScId,
    applies_to_json: JSON.stringify(entry.appliesTo),
    last_saved_at: entry.lastSavedAt,
    updated_at: client.fn.now(),
  };
}

function toRiScEntityIndexRows(entry: RiScIndexEntry): RiScEntityIndexRow[] {
  return [...new Set(entry.appliesTo)].map(entityRef => ({
    entity_ref: entityRef,
    source_file_path: entry.sourceFilePath,
  }));
}

function rowToRiScIndexEntry(row: RiScIndexRow): RiScIndexEntry {
  return {
    sourceFilePath: row.source_file_path,
    riScId: row.risc_id,
    appliesTo: JSON.parse(row.applies_to_json) as string[],
    lastSavedAt: row.last_saved_at,
  };
}

function getEntryKey(entry: RiScIndexEntry): string {
  return entry.sourceFilePath;
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}
