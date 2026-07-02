export const schemaPath = '../risc_schema_en_v5_4.json';

export const latestSupportedVersion = '5.4';

export const BASE_NUMBER = 20.0;
export const CONSEQUENCE_SCALE_OFFSET = 3;
export const PROBABILITY_SCALE_OFFSET = -2;

export const consequenceOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + CONSEQUENCE_SCALE_OFFSET),
);

export const probabilityOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + PROBABILITY_SCALE_OFFSET),
);

export type ConsequenceCategory =
  | 'operationalStability'
  | 'health'
  | 'privacy'
  | 'reputation'
  | 'environment'
  | 'economical'
  | 'goalAchievement';

/**
 * Single source of truth for the consequence table rows, in display order.
 *
 * Every dimension is ratable at all five levels (there is no void-cell pattern),
 * so the table renders a full 7 × 5 grid. The matching `consequenceTable`
 * translation keys (`columns.<key>` and `cells.<key>.<level>`) must stay in sync
 * with this list.
 */
export const consequenceCategoryOrder: ConsequenceCategory[] = [
  'operationalStability',
  'health',
  'privacy',
  'reputation',
  'environment',
  'economical',
  'goalAchievement',
];

export type ProbabilityCategory =
  | 'frequency'
  | 'intentional'
  | 'goalAchievement';

/**
 * Single source of truth for the probability table rows, in display order.
 *
 * The table mirrors the consequence layout: each category is a row, described at
 * all five probability levels. The matching `probabilityTable` translation keys
 * (`columns.<key>` and `cells.<key>.<level>`) must stay in sync with this list.
 */
export const probabilityCategoryOrder: ProbabilityCategory[] = [
  'frequency',
  'intentional',
  'goalAchievement',
];

export enum ThreatActorsOptions {
  ScriptKiddie = 'Script kiddie',
  Hacktivist = 'Hacktivist',
  RecklessEmployee = 'Reckless employee',
  Insider = 'Insider',
  OrganisedCrime = 'Organised crime',
  TerroristOrganisation = 'Terrorist organisation',
  NationGovernment = 'Nation/government',
}

export enum VulnerabilitiesOptions {
  FlawedDesign = 'Flawed design',
  Misconfiguration = 'Misconfiguration',
  DependencyVulnerability = 'Dependency vulnerability',
  UnauthorizedAccess = 'Unauthorized access',
  UnmonitoredUse = 'Unmonitored use',
  InputTampering = 'Input tampering',
  InformationLeak = 'Information leak',
  ExcessiveUse = 'Excessive use',
}

export enum ActionStatusOptions {
  OK = 'OK',
  NotOK = 'Not OK',
  NotRelevant = 'Not relevant',
}

// Colors follow the shared Kartverket risk matrix (backend docs/new-matrix):
// risk value = probability level × consequence level, banded as
// 1–5 green, 6–10 yellow, 11–15 orange, 16–25 red.
const grn = 'var(--ros-green-100)';
const ylw = 'var(--ros-yellow-100)';
const org = 'var(--ros-orange-100)';
const red = 'var(--ros-red-300)';

export const riskMatrix = [
  [grn, ylw, org, red, red],
  [grn, ylw, org, red, red],
  [grn, ylw, ylw, org, org],
  [grn, grn, ylw, ylw, ylw],
  [grn, grn, grn, grn, grn],
];

const sGrn = 'var(--ros-green-300)';
const sYlw = 'var(--ros-yellow-300)';
const sOrg = 'var(--ros-orange-300)';
const sRed = 'var(--ros-red-500)';

export const riskMatrixStroke = [
  [sGrn, sYlw, sOrg, sRed, sRed],
  [sGrn, sYlw, sOrg, sRed, sRed],
  [sGrn, sYlw, sYlw, sOrg, sOrg],
  [sGrn, sGrn, sYlw, sYlw, sYlw],
  [sGrn, sGrn, sGrn, sGrn, sGrn],
];

export const urlRegExpPattern: RegExp =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
