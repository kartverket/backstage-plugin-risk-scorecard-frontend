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

/** All supported versions in order from oldest to newest. */
export const ALL_RISC_VERSIONS: RiScVersion[] = [
  RiScVersion.V3_2,
  RiScVersion.V3_3,
  RiScVersion.V4_0,
  RiScVersion.V4_1,
  RiScVersion.V4_2,
  RiScVersion.V5_0,
  RiScVersion.V5_1,
  RiScVersion.V5_2,
];

/** The latest schema version used when creating new RiScs. */
export const latestSupportedVersion = RiScVersion.V5_2;

/** Branch prefix for draft RiScs in GitHub. */
export const DRAFT_BRANCH_PREFIX = 'risc-draft/';

/** File naming pattern for RiSc YAML files. */
export const RISC_FILE_PREFIX = '.ros_';
export const RISC_FILE_SUFFIX = '.yaml';

/** Directory within the repo where RiSc files are stored. */
export const RISC_DIRECTORY = '.ros/';

/** Risk matrix scoring constants (logarithmic scale). */
export const BASE_NUMBER = 20.0;
export const CONSEQUENCE_SCALE_OFFSET = 3;
export const PROBABILITY_SCALE_OFFSET = -2;

/** Calculated probability options (5 levels). */
export const probabilityOptions: number[] = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + PROBABILITY_SCALE_OFFSET),
);

/** Calculated consequence options (5 levels). */
export const consequenceOptions: number[] = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + CONSEQUENCE_SCALE_OFFSET),
);
