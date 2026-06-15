import {
  latestRiScSchema,
  latestSupportedVersion,
  riscSchemas,
  supportedRiScVersions,
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
  it('schema registry follows the supported version order', () => {
    expect(riscSchemas.map(({ version }) => version)).toEqual([
      ...supportedRiScVersions,
    ]);
  });

  it.each(riscSchemas)(
    '$version schema metadata matches registry version',
    ({ version, schema }) => {
      expect(schema.properties.schemaVersion.default).toBe(`'${version}'`);
    },
  );

  it('latest schema metadata matches the latest supported version', () => {
    expect(latestRiScSchema.properties.schemaVersion.default).toBe(
      `'${latestSupportedVersion}'`,
    );
  });

  it.each([
    [
      'consequenceOptions',
      consequenceOptions,
      latestRiScSchema.$defs.risk.properties.consequence.anyOf[0].enum,
    ],
    [
      'probabilityOptions',
      probabilityOptions,
      latestRiScSchema.$defs.risk.properties.probability.anyOf[0].enum,
    ],
    [
      'ActionStatusOptions',
      Object.values(ActionStatusOptions),
      latestRiScSchema.$defs.action.properties.status.enum,
    ],
    [
      'ThreatActorsOptions',
      Object.values(ThreatActorsOptions),
      latestRiScSchema.$defs.scenario.properties.threatActors.items.enum,
    ],
    [
      'VulnerabilitiesOptions',
      Object.values(VulnerabilitiesOptions),
      latestRiScSchema.$defs.scenario.properties.vulnerabilities.items.enum,
    ],
  ])('%s matches the latest schema', (_name, actual, expected) => {
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
