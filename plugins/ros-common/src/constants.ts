/**
 * Schema versions supported by the RiSc backend.
 * Migration pipeline handles v3.2 → v5.2.
 */
export enum RiScVersion {
  V3_2 = '3.2',
  V3_3 = '3.3',
  V4_0 = '4.0',
  V4_1 = '4.1',
  V4_2 = '4.2',
  V5_0 = '5.0',
  V5_1 = '5.1',
  V5_2 = '5.2',
}

/** The latest schema version used when creating new RiScs. */
export const latestSupportedVersion = RiScVersion.V5_2;

/** Branch prefix for draft RiScs in GitHub. */
export const DRAFT_BRANCH_PREFIX = 'risc-draft/';

/** File naming pattern for RiSc YAML files. */
export const RISC_FILE_PREFIX = '.ros_';
export const RISC_FILE_SUFFIX = '.yaml';
