import {
  currentRiScSchema,
  currentRiScSchemaVersion,
  riscSchemas,
} from '@kartverket/ros-common';

import {
  ActionStatusOptions,
  consequenceOptions,
  probabilityOptions,
  riskMatrix,
  riskMatrixStroke,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from './constants';

function expectArrayMatches(
  actual: unknown[],
  expected: unknown[] | undefined,
) {
  if (!expected) {
    throw new Error('Expected schema enum to be defined');
  }
  expect([...actual].sort()).toEqual([...expected].sort());
}

describe('Constants match schema', () => {
  it.each(riscSchemas)(
    '$version schema metadata matches registry version',
    ({ version, schema }) => {
      expect(schema.properties.schemaVersion.default).toBe(`'${version}'`);
    },
  );

  it('current schema metadata matches the current schema version', () => {
    expect(currentRiScSchema.properties.schemaVersion.default).toBe(
      `'${currentRiScSchemaVersion}'`,
    );
  });

  it.each([
    [
      'consequenceOptions',
      consequenceOptions,
      currentRiScSchema.$defs.risk.properties.consequence.anyOf[0].enum,
    ],
    [
      'probabilityOptions',
      probabilityOptions,
      currentRiScSchema.$defs.risk.properties.probability.anyOf[0].enum,
    ],
    [
      'ActionStatusOptions',
      Object.values(ActionStatusOptions),
      currentRiScSchema.$defs.action.properties.status.enum,
    ],
    [
      'ThreatActorsOptions',
      Object.values(ThreatActorsOptions),
      currentRiScSchema.$defs.scenario.properties.threatActors.items.enum,
    ],
    [
      'VulnerabilitiesOptions',
      Object.values(VulnerabilitiesOptions),
      currentRiScSchema.$defs.scenario.properties.vulnerabilities.items.enum,
    ],
  ])('%s matches the current schema', (_name, actual, expected) => {
    expectArrayMatches(actual, expected);
  });

  it.each([
    ['riskMatrix', riskMatrix],
    ['riskMatrixStroke', riskMatrixStroke],
  ])('%s dimensions match risk option counts', (_name, matrix) => {
    expect(matrix).toHaveLength(probabilityOptions.length);
    matrix.forEach(row => {
      expect(row).toHaveLength(consequenceOptions.length);
    });
  });
});
