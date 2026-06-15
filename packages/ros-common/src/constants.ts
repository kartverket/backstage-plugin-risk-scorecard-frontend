/**
 * Schema versions supported by RiSc.
 * Migration pipeline handles v3.2 → v5.4.
 */
export const RiScVersion = {
  V3_2: '3.2',
  V3_3: '3.3',
  V4_0: '4.0',
  V4_1: '4.1',
  V4_2: '4.2',
  V5_0: '5.0',
  V5_1: '5.1',
  V5_2: '5.2',
  V5_3: '5.3',
  V5_4: '5.4',
} as const;

export type RiScVersion = (typeof RiScVersion)[keyof typeof RiScVersion];

export const supportedRiScVersions = [
  RiScVersion.V3_2,
  RiScVersion.V3_3,
  RiScVersion.V4_0,
  RiScVersion.V4_1,
  RiScVersion.V4_2,
  RiScVersion.V5_0,
  RiScVersion.V5_1,
  RiScVersion.V5_2,
  RiScVersion.V5_3,
  RiScVersion.V5_4,
] as const satisfies readonly RiScVersion[];

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

/** The latest schema version used when creating new RiScs. */
export const latestSupportedVersion = last(supportedRiScVersions);

/** File naming pattern for RiSc YAML files. */
export const RISC_FILE_PREFIX = 'risc-';
export const RISC_FILE_SUFFIX = '.risc.yaml';

/** Directory within the repo where RiSc files are stored. */
export const RISC_DIRECTORY = '.security/risc';

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
