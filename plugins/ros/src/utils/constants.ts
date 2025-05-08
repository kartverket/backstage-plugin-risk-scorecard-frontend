export const schemaPath = '../risc_schema_en_v4_1.json';

export const latestSupportedVersion = '4.1';

export const BASE_NUMBER = 20.0;

export const consequenceOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + 3),
);

export const probabilityOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i - 2),
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
  NotStarted = 'Not started',
  InProgress = 'In progress',
  OnHold = 'On hold',
  Completed = 'Completed',
  Aborted = 'Aborted',
}

export const riskMatrix = [
  ['#FBE36A', '#FF8B38', '#FF8B38', '#F23131', '#F23131'],
  ['#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38', '#F23131'],
  ['#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A'],
];

export const urlRegExpPattern: RegExp =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
