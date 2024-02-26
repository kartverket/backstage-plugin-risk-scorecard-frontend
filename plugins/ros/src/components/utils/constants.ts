import schema from '../../ros_schema_no_v1_0.json';

export const konsekvensOptions = schema.$defs.risiko.properties.konsekvens.enum;
export const sannsynlighetOptions =
  schema.$defs.risiko.properties.sannsynlighet.enum;
export const trusselaktørerOptions =
  schema.properties.scenarier.items.properties.trusselaktører.items.enum;
export const sårbarheterOptions =
  schema.properties.scenarier.items.properties.sårbarheter.items.enum;
export const options = ['1', '2', '3', '4', '5'];
