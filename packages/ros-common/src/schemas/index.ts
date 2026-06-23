import {
  RiScVersion,
  latestSupportedVersion,
  supportedRiScVersions,
} from '../constants';
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

export const riscSchemasByVersion = {
  [RiScVersion.V3_2]: riscSchemaV3_2,
  [RiScVersion.V3_3]: riscSchemaV3_3,
  [RiScVersion.V4_0]: riscSchemaV4_0,
  [RiScVersion.V4_1]: riscSchemaV4_1,
  [RiScVersion.V4_2]: riscSchemaV4_2,
  [RiScVersion.V5_0]: riscSchemaV5_0,
  [RiScVersion.V5_1]: riscSchemaV5_1,
  [RiScVersion.V5_2]: riscSchemaV5_2,
  [RiScVersion.V5_3]: riscSchemaV5_3,
  [RiScVersion.V5_4]: riscSchemaV5_4,
} as const satisfies Record<RiScVersion, unknown>;

export const riscSchemas = supportedRiScVersions.map(version => ({
  version,
  schema: riscSchemasByVersion[version],
}));

export const latestRiScSchema = riscSchemasByVersion[latestSupportedVersion];
