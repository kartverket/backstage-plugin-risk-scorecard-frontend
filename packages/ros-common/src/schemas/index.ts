import schemaV3_2 from './risc_schema_en_v3_2.json';
import schemaV3_3 from './risc_schema_en_v3_3.json';
import schemaV4_0 from './risc_schema_en_v4_0.json';
import schemaV4_1 from './risc_schema_en_v4_1.json';
import schemaV4_2 from './risc_schema_en_v4_2.json';
import schemaV5_0 from './risc_schema_en_v5_0.json';
import schemaV5_1 from './risc_schema_en_v5_1.json';
import schemaV5_2 from './risc_schema_en_v5_2.json';
import schemaV5_3 from './risc_schema_en_v5_3.json';
import schemaV5_4 from './risc_schema_en_v5_4.json';

export const riscSchemaV3_2 = schemaV3_2;
export const riscSchemaV3_3 = schemaV3_3;
export const riscSchemaV4_0 = schemaV4_0;
export const riscSchemaV4_1 = schemaV4_1;
export const riscSchemaV4_2 = schemaV4_2;
export const riscSchemaV5_0 = schemaV5_0;
export const riscSchemaV5_1 = schemaV5_1;
export const riscSchemaV5_2 = schemaV5_2;
export const riscSchemaV5_3 = schemaV5_3;
export const riscSchemaV5_4 = schemaV5_4;

export const riscSchemas = [
  { version: '3.2', schema: riscSchemaV3_2 },
  { version: '3.3', schema: riscSchemaV3_3 },
  { version: '4.0', schema: riscSchemaV4_0 },
  { version: '4.1', schema: riscSchemaV4_1 },
  { version: '4.2', schema: riscSchemaV4_2 },
  { version: '5.0', schema: riscSchemaV5_0 },
  { version: '5.1', schema: riscSchemaV5_1 },
  { version: '5.2', schema: riscSchemaV5_2 },
  { version: '5.3', schema: riscSchemaV5_3 },
  { version: '5.4', schema: riscSchemaV5_4 },
] as const;

type Last<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer LastItem,
]
  ? LastItem
  : never;

function last<const T extends readonly [unknown, ...unknown[]]>(
  items: T,
): Last<T> {
  return items[items.length - 1] as Last<T>;
}

const currentRiScSchemaDefinition = last(riscSchemas);

export const currentRiScSchemaVersion = currentRiScSchemaDefinition.version;
export const currentRiScSchema = currentRiScSchemaDefinition.schema;
