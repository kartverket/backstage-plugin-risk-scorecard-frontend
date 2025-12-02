export const schemaPath = '../risc_schema_en_v5_1.json';

export const latestSupportedVersion = '5.1';

export const BASE_NUMBER = 20.0;
export const CONSEQUENCE_SCALE_OFFSET = 3;
export const PROBABILITY_SCALE_OFFSET = -2;

export const consequenceOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + CONSEQUENCE_SCALE_OFFSET),
);

export const probabilityOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + PROBABILITY_SCALE_OFFSET),
);

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

const grn = 'var(--ros-green-100)';
const ylw = 'var(--ros-orange-100)';
const red = 'var(--ros-red-300)';
const drd = 'var(--ros-red-400)';

export const riskMatrix = [
  [ylw, red, red, drd, drd],
  [ylw, ylw, red, red, drd],
  [grn, ylw, ylw, red, red],
  [grn, grn, ylw, ylw, red],
  [grn, grn, grn, ylw, ylw],
];

const sGrn = 'var(--ros-green-300)';
const sYlw = 'var(--ros-orange-300)';
const sRed = 'var(--ros-red-500)';
const sDrd = 'var(--ros-red-600)';

export const riskMatrixStroke = [
  [sYlw, sRed, sRed, sDrd, sDrd],
  [sYlw, sYlw, sRed, sRed, sDrd],
  [sGrn, sYlw, sYlw, sRed, sRed],
  [sGrn, sGrn, sYlw, sYlw, sRed],
  [sGrn, sGrn, sGrn, sYlw, sYlw],
];

export const urlRegExpPattern: RegExp =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
