import schema from '../../risc_schema_en_v3_2.json';

export const konsekvensOptions =
  schema.$defs.risk.properties.consequence.anyOf[0].enum;
export const sannsynlighetOptions =
  schema.$defs.risk.properties.probability.anyOf[0].enum;
export const trusselaktørerOptions =
  schema.$defs.scenario.properties.threatActor.items.enum;
export const sårbarheterOptions =
  schema.$defs.scenario.properties.vulnerabilities.items.enum;
export const options = ['1', '2', '3', '4', '5'];

export const riskMatrix = [
  ['#FBE36A', '#FF8B38', '#FF8B38', '#F23131', '#F23131'],
  ['#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38', '#F23131'],
  ['#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A', '#FF8B38'],
  ['#6CC6A4', '#6CC6A4', '#6CC6A4', '#FBE36A', '#FBE36A'],
];

export const scenarioTittelError = 'Scenarioet må ha en tittel';
