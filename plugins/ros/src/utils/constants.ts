import schema from '../risc_schema_en_v4_0.json';

export const BASE_NUMBER = 20.0;

export const consequenceOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i + 3),
);
export const probabilityOptions = Array.from({ length: 5 }, (_, i) =>
  Math.pow(BASE_NUMBER, i - 2),
);
export const threatActorsOptions =
  schema.$defs.scenario.properties.threatActors.items.enum;
export const vulnerabilitiesOptions =
  schema.$defs.scenario.properties.vulnerabilities.items.enum;
export const actionStatusOptions = schema.$defs.action.properties.status.enum;

export const riskMatrix = [
  ['#FBE36A', '#FF8B38', '#FF8B38', '#F23131', '#F23131'],
  ['#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38', '#F23131'],
  ['#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A'],
];

export const latestSupportedVersion = '4.0';

export const urlRegExpPattern: RegExp =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
