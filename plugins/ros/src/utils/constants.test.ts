import {
  ActionStatusOptions,
  consequenceOptions,
  probabilityOptions,
  schemaPath,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from './constants';

let schema: any;
beforeAll(async () => {
  schema = await import(schemaPath);
});

function expectArrayMatches(actual: unknown[], expected: unknown[]) {
  expect([...actual].sort()).toEqual([...expected].sort());
}

describe('Constants match schema', () => {
  it('consequenceOptions list matches values from schema', () => {
    const schemaConsequence =
      schema.$defs.risk.properties.consequence.anyOf[0].enum;
    expectArrayMatches(consequenceOptions, schemaConsequence);
  });

  it('probabilityOptions list matches values from schema', () => {
    const schemaProbability =
      schema.$defs.risk.properties.probability.anyOf[0].enum;
    expectArrayMatches(probabilityOptions, schemaProbability);
  });

  it('actionStatusOptions enum matches values from schema', () => {
    const schemaActionStatus = schema.$defs.action.properties.status.enum;
    const enumValues = Object.values(ActionStatusOptions);
    expectArrayMatches(enumValues, schemaActionStatus);
  });

  it('threatActorsOptions enum matches values from schema', () => {
    const schemaThreatActors =
      schema.$defs.scenario.properties.threatActors.items.enum;
    const enumValues = Object.values(ThreatActorsOptions);
    expectArrayMatches(enumValues, schemaThreatActors);
  });

  it('vulnerabilitiesOptions enum matches values from schema', () => {
    const schemaVulnerabilities =
      schema.$defs.scenario.properties.vulnerabilities.items.enum;
    const enumValues = Object.values(VulnerabilitiesOptions);
    expectArrayMatches(enumValues, schemaVulnerabilities);
  });
});
