import {
  ActionStatusOptions,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from './constants';
import { pluginRiScMessages } from './translations';
import { Action, RiSc, RiScWithMetadata, Scenario } from './types';
import {
  UpdatedStatusEnum,
  actionStatusOptionsToTranslationKeys,
  calculateDaysSince,
  calculateUpdatedStatus,
  deleteScenario,
  findConsequenceIndex,
  findProbabilityIndex,
  formatNOK,
  formatNumber,
  generateRandomId,
  isDeeplyEqual,
  parseISODateFromEncryptedROS,
  requiresNewApproval,
  roundConsequenceToNearestConsequenceOption,
  roundProbabilityToNearestProbabilityOption,
  threatActorOptionsToTranslationKeys,
  vulnerabiltiesOptionsToTranslationKeys,
} from './utilityfunctions';

describe('generateRandomId', () => {
  test('should generate a random id of specified length', () => {
    const id = generateRandomId();
    expect(id).toHaveLength(5);
  });

  test('should generate unique ids', () => {
    const id1 = generateRandomId();
    const id2 = generateRandomId();
    expect(id1).not.toEqual(id2);
  });
});

describe('formatNOK', () => {
  it('formats numbers without decimal digits', () => {
    expect(formatNOK(1000.3)).toBe('1 000');
    expect(formatNOK(1000000.23)).toBe('1 000 000');
  });
});

describe('calculateDaysSince', () => {
  it('calculates days from a given date to now', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(calculateDaysSince(twoDaysAgo)).toBe(2);
  });
});

describe('calculateUpdatedStatus', () => {
  it('returns correct status when commits argument is omitted (days-only)', () => {
    expect(calculateUpdatedStatus(0)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(5)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(6)).toBe(UpdatedStatusEnum.UPDATED);

    expect(calculateUpdatedStatus(7)).toBe(UpdatedStatusEnum.LITTLE_OUTDATED);
    expect(calculateUpdatedStatus(20)).toBe(UpdatedStatusEnum.LITTLE_OUTDATED);
    expect(calculateUpdatedStatus(27)).toBe(UpdatedStatusEnum.LITTLE_OUTDATED);

    expect(calculateUpdatedStatus(28)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(30)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(51)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(55)).toBe(UpdatedStatusEnum.OUTDATED);

    expect(calculateUpdatedStatus(56)).toBe(UpdatedStatusEnum.VERY_OUTDATED);
    expect(calculateUpdatedStatus(120)).toBe(UpdatedStatusEnum.VERY_OUTDATED);
    expect(calculateUpdatedStatus(439)).toBe(UpdatedStatusEnum.VERY_OUTDATED);
  });

  it('returns correct status for commits > 50', () => {
    expect(calculateUpdatedStatus(10, 51)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
    expect(calculateUpdatedStatus(100, 100)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits between 26 and 50', () => {
    expect(calculateUpdatedStatus(20, 30)).toBe(
      UpdatedStatusEnum.LITTLE_OUTDATED,
    );
    expect(calculateUpdatedStatus(60, 30)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(100, 30)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits between 11 and 25', () => {
    expect(calculateUpdatedStatus(20, 15)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(90, 15)).toBe(
      UpdatedStatusEnum.LITTLE_OUTDATED,
    );
    expect(calculateUpdatedStatus(180, 15)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(200, 15)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits <= 10', () => {
    expect(calculateUpdatedStatus(60, 5)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(120, 5)).toBe(
      UpdatedStatusEnum.LITTLE_OUTDATED,
    );
    expect(calculateUpdatedStatus(300, 5)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(400, 5)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });
});

describe('requiresNewApproval', () => {
  const action: Action = {
    ID: '1',
    title: 'Action 1',
    description: 'Action description',
    status: 'Open',
    url: 'http://example.com/action1',
  };

  const scenario: Scenario = {
    ID: '1',
    title: 'Scenario 1',
    url: 'http://example.com',
    description: 'Description 1',
    threatActors: ['actor1'],
    vulnerabilities: ['vuln1'],
    risk: {
      summary: 'Risk summary',
      probability: 1,
      consequence: 1,
    },
    remainingRisk: {
      summary: 'Remaining risk summary',
      probability: 3,
      consequence: 3,
    },
    actions: [action],
  };

  const riSc: RiSc = {
    schemaVersion: '4.0',
    title: 'Test Title',
    scope: 'Scope',
    scenarios: [scenario],
    metadata: {
      backstage: {
        entityRef: '',
      },
    },
  };

  it('returns false if risc is equal', () => {
    expect(requiresNewApproval(riSc, riSc)).toBe(false);
  });

  it('returns false if risc is equal for several scenarios', () => {
    const riScWithSeveralScenarios: RiSc = {
      ...riSc,
      scenarios: [
        scenario,
        { ...scenario, ID: '2', actions: [action, { ...action, ID: '2' }] },
      ],
    };
    expect(
      requiresNewApproval(riScWithSeveralScenarios, riScWithSeveralScenarios),
    ).toBe(false);
  });

  it('returns true for diff on scenario title, description or url', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, title: 'new title' }],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, description: 'new description' }],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, url: 'new url' }],
      }),
    ).toBe(true);
  });

  it('returns true for diff on action', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            actions: [{ ...action, ID: 'new id' }],
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            actions: [{ ...action, title: 'new title' }],
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            actions: [{ ...action, description: 'new description' }],
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            actions: [{ ...action, status: 'new status' }],
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            actions: [{ ...action, url: 'new url' }],
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns true if number of scenarios differ', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [scenario, scenario],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(
        {
          ...riSc,
          scenarios: [scenario, scenario],
        },
        riSc,
      ),
    ).toBe(true);
  });

  it('returns true if number of actions differ', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, actions: [action, action, action] }],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(
        {
          ...riSc,
          scenarios: [{ ...scenario, actions: [action, action, action] }],
        },
        riSc,
      ),
    ).toBe(true);
  });

  it('returns true if riSc doesnt contain previously existing scenarios', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, ID: 'new Id' }],
      }),
    ).toBe(true);
  });

  it('returns true if diff on threatActors', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [{ ...scenario, threatActors: ['new threat actor'] }],
      }),
    ).toBe(true);

    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            threatActors: [scenario.threatActors[0], scenario.threatActors[0]],
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns true if diff on vulnerabilities', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            vulnerabilities: ['new vulnerability'],
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            vulnerabilities: [
              scenario.vulnerabilities[0],
              scenario.vulnerabilities[0],
            ],
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns true if diff on risk', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            risk: { ...scenario.risk, summary: 'new summary' },
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            risk: { ...scenario.risk, probability: 5 },
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            risk: { ...scenario.risk, consequence: 5 },
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns true if diff on remaining risk', () => {
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            remainingRisk: {
              ...scenario.remainingRisk,
              summary: 'new summary',
            },
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            remainingRisk: { ...scenario.remainingRisk, probability: 5 },
          },
        ],
      }),
    ).toBe(true);
    expect(
      requiresNewApproval(riSc, {
        ...riSc,
        scenarios: [
          {
            ...scenario,
            remainingRisk: { ...scenario.remainingRisk, consequence: 5 },
          },
        ],
      }),
    ).toBe(true);
  });
});

describe('formatNumber', () => {
  const mockT = (key: string, { count }: any) =>
    `${count} ${key.split('.').pop()}`;

  it('formats small numbers', () => {
    expect(formatNumber(9200, mockT)).toBe('9 200');
  });

  it('formats thousands correctly', () => {
    expect(formatNumber(150000, mockT)).toBe('150 thousand');
  });

  it('formats millions correctly', () => {
    expect(formatNumber(2_500_000, mockT)).toBe('3 million');
  });

  it('formats billions correctly', () => {
    expect(formatNumber(3_200_000_000, mockT)).toBe('3 billion');
  });

  it('formats trillions correctly', () => {
    expect(formatNumber(3_200_000_000_000, mockT)).toBe('3 trillion');
  });
});

describe('parseISODateFromEncryptedROS', () => {
  it('should parse a valid ISO date string', () => {
    const isoDate = '2023-10-01T12:00:00Z';
    const result = parseISODateFromEncryptedROS(isoDate);
    expect(result).toBe('2023-10-01T12:00:00Z');
  });

  it('should parse a valid ISO date string with extra escaped quotations', () => {
    const isoDate = '\"2023-10-01T12:00:00Z\"';
    const result = parseISODateFromEncryptedROS(isoDate);
    expect(result).toBe('2023-10-01T12:00:00Z');
  });

  it('should return null for an invalid date string', () => {
    const invalidDate = 'invalid-date';
    const result = parseISODateFromEncryptedROS(invalidDate);
    expect(result).toBeNull();
  });

  it('should return null for an empty string', () => {
    const emptyString = '';
    const result = parseISODateFromEncryptedROS(emptyString);
    expect(result).toBeNull();
  });
});

describe('deleteScenario', () => {
  const scenario1: Scenario = {
    ID: '1',
    title: 'Scenario 1',
    description: 'Description 1',
    threatActors: ['actor1'],
    vulnerabilities: ['vuln1'],
    risk: { summary: 'Risk summary', probability: 1, consequence: 1 },
    remainingRisk: {
      summary: 'Remaining risk summary',
      probability: 3,
      consequence: 3,
    },
    actions: [],
  };
  const scenario2: Scenario = { ...scenario1, ID: '2' };

  const riSc: RiSc = {
    scenarios: [scenario1, scenario2],
  } as Partial<RiSc> as RiSc;

  it('deletes the correct scenario by ID and updates RiSc', () => {
    const updateRiSc = jest.fn();

    deleteScenario(
      { content: riSc } as Partial<RiScWithMetadata> as RiScWithMetadata,
      updateRiSc,
      scenario1,
    );

    expect(updateRiSc).toHaveBeenCalledWith({
      content: {
        ...riSc,
        scenarios: [scenario2],
      },
    });
  });
});

describe('isDeeplyEqual', () => {
  const testCases: [unknown, unknown, boolean][] = [
    [0, 0, true],
    [0, 1, false],
    ['', '', true],
    ['', 'a', false],
    ['b', 'a', false],
    [null, null, true],
    [undefined, undefined, true],
    [[], [], true],
    [[], [1], false],
    [{}, {}, true],
    [{}, { 0: 1 }, false],
    [0, '', false],
    [0, 'a', false],
    [0, null, false],
    [0, undefined, false],
    [0, [], false],
    [0, {}, false],
    ['', null, false],
    ['', undefined, false],
    ['', [], false],
    ['', {}, false],
    [[0], { '0': 0 }, false],
    [[0], { 0: 0 }, false],
    [[0, 3, 4], [0, 3, 4], true],
    [{ 0: 1 }, { 0: 1 }, true],
    [{ 0: [0, 1], 1: [2, 3] }, { 0: [0, 1], 1: [2, 3] }, true],
    [{ 0: [0, 1], 1: [2, 3] }, { 0: [0, 1] }, false],
    [{ 0: { a: 'b' } }, { 0: [0, 1] }, false],
    [{ 0: { a: 'b' } }, { 0: { a: 'b' } }, true],
    [{ 0: { a: { b: 1 } } }, { 0: { a: 'b' } }, false],
    [{ 0: { a: { b: 1 } } }, { 0: { a: { b: 1 } } }, true],
    [{ 0: { a: { b: 1 } } }, { 0: { a: { b: 1, c: 1 } } }, false],
    [{ 0: { a: { b: 1, c: 1 }, b: 1 } }, { 0: { a: { b: 1, c: 1 } } }, false],
    [{ 0: 1 }, { '0': 1 }, true],
  ];

  testCases.forEach(([a, b, result]) =>
    test(`isDeeplyEqual(${JSON.stringify(a)}, ${JSON.stringify(b)})`, () => {
      expect(isDeeplyEqual(a, b)).toBe(result);
    }),
  );

  const testCasesIgnored: [unknown, unknown, string[], boolean][] = [
    [0, 0, [], true],
    [0, 0, ['test'], true],
    [{}, { test: 0 }, ['test'], true],
    [{ test: 1 }, { test: 0 }, ['test'], true],
    [{ test: 1 }, { test: 0 }, ['test2'], false],
    [{ test: { a: 1 } }, { test: 0 }, ['test'], true],
    [{ test: 0 }, 'a', ['test'], false],
  ];

  testCasesIgnored.forEach(([a, b, ignored, result]) =>
    test(`isDeeplyEqual(${JSON.stringify(a)}, ${JSON.stringify(
      b,
    )}, ${JSON.stringify(ignored)})`, () => {
      expect(isDeeplyEqual(a, b, ignored)).toBe(result);
    }),
  );
});

describe('Translation mappings cover all enum values', () => {
  it('translatedActionStatuses covers all ActionStatusOptions', () => {
    const enumValues = Object.values(ActionStatusOptions);
    const translatedKeys = Object.keys(actionStatusOptionsToTranslationKeys);

    expect(translatedKeys.sort()).toEqual(enumValues.sort());
  });

  it('translatedThreatActors covers all ThreatActorsOptions', () => {
    const enumValues = Object.values(ThreatActorsOptions);
    const translatedKeys = Object.keys(threatActorOptionsToTranslationKeys);

    expect(translatedKeys.sort()).toEqual(enumValues.sort());
  });

  it('translatedVulnerabilities covers all VulnerabilitiesOptions', () => {
    const enumValues = Object.values(VulnerabilitiesOptions);
    const translatedKeys = Object.keys(vulnerabiltiesOptionsToTranslationKeys);

    expect(translatedKeys.sort()).toEqual(enumValues.sort());
  });
});

describe('Translation mappings match translation keys', () => {
  it('translatedActionStatusOptions values should match corresponding keys in translations', () => {
    const optionToTranslationValues = Object.values(
      actionStatusOptionsToTranslationKeys,
    );
    optionToTranslationValues.forEach(value => {
      const key = value.replace('actionStatus.', '');
      expect(pluginRiScMessages.actionStatus).toHaveProperty(key);
    });
  });
});

it('translatedThreatActorOptions values should match corresponding keys in translations', () => {
  const optionToTranslationValues = Object.values(
    threatActorOptionsToTranslationKeys,
  ).sort();
  const translationKeys = Object.keys(pluginRiScMessages.threatActors).sort();

  optionToTranslationValues.forEach((value, index) => {
    const translationKey = translationKeys[index];
    expect(value).toBe(`threatActors.${translationKey}`);
  });
});

it('translatedVulnerabilitiesOptions values should match corresponding keys in translations', () => {
  const optionToTranslationValues = Object.values(
    vulnerabiltiesOptionsToTranslationKeys,
  ).sort();
  const translationKeys = Object.keys(
    pluginRiScMessages.vulnerabilities,
  ).sort();

  optionToTranslationValues.forEach((value, index) => {
    const translationKey = translationKeys[index];
    expect(value).toBe(`vulnerabilities.${translationKey}`);
  });
});

describe('Enum to translation key maps', () => {
  it('actionStatusOptionsToTranslationKeys keys should match ActionStatusOptions values', () => {
    const enumValues = Object.values(ActionStatusOptions);
    const mapKeys = Object.keys(actionStatusOptionsToTranslationKeys);
    expect(mapKeys.sort()).toEqual(enumValues.sort());
  });

  it('threatActorOptionsToTranslationKeys keys should match ThreatActorsOptions values', () => {
    const enumValues = Object.values(ThreatActorsOptions);
    const mapKeys = Object.keys(threatActorOptionsToTranslationKeys);
    expect(mapKeys.sort()).toEqual(enumValues.sort());
  });

  it('vulnerabiltiesOptionsToTranslationKeys keys should match VulnerabilitiesOptions values', () => {
    const enumValues = Object.values(VulnerabilitiesOptions);
    const mapKeys = Object.keys(vulnerabiltiesOptionsToTranslationKeys);
    expect(mapKeys.sort()).toEqual(enumValues.sort());
  });
});

describe('findProbabilityIndex', () => {
  it.each([
    [1 / 400, 0], // 20^-2
    [1 / 20, 1], // 20^-1
    [1, 2], // 20^0
    [20, 3], // 20^1
    [400, 4], // 20^2
  ])('returns %i for probability %f', (input, expected) => {
    expect(findProbabilityIndex(input)).toBe(expected);
  });

  it('clamps low values to 0', () => {
    expect(findProbabilityIndex(1e-10)).toBe(0);
  });

  it('clamps high values to 4', () => {
    expect(findProbabilityIndex(1e5)).toBe(4);
  });

  it('handles values between defined steps', () => {
    // log_20(4.47) + 2 = ~2.49 => round to 2
    expect(findProbabilityIndex(4.47)).toBe(2);
  });
});

describe('findConsequenceIndex', () => {
  it.each([
    [8000, 0], // 20^3
    [160000, 1], // 20^4
    [3200000, 2], // 20^5
    [64000000, 3], // 20^6
    [1280000000, 4], // 20^7
  ])('returns %i for consequence %f', (input, expected) => {
    expect(findConsequenceIndex(input)).toBe(expected);
  });

  it('clamps low values to 0', () => {
    expect(findConsequenceIndex(1000)).toBe(0);
  });

  it('clamps high values to 4', () => {
    expect(findConsequenceIndex(1e10)).toBe(4);
  });

  it('handles values between defined steps', () => {
    // log_20(15M) - 3 = ~2.51 => round to 3
    expect(findConsequenceIndex(15000000)).toBe(3);
  });
});

describe('roundConsequenceToNearestConsequenceOption', () => {
  it.each([
    [8000, 8000], // Exact match for index 0
    [160000, 160000], // Exact match for index 1
    [3200000, 3200000], // Exact match for index 2
    [64000000, 64000000], // Exact match for index 3
    [1280000000, 1280000000], // Exact match for index 4
  ])('returns exact match %i for consequence %f', (input, expected) => {
    expect(roundConsequenceToNearestConsequenceOption(input)).toBe(expected);
  });

  it.each([
    [10000, 8000], // round to 8000 (index 0)
    [1000000, 3200000], // round to 3200000 (index 3)
  ])('rounds %i to nearest consequence %f', (input, expected) => {
    expect(roundConsequenceToNearestConsequenceOption(input)).toBe(expected);
  });

  it.each([
    [1e10, 1280000000], // Clamped to index 4
    [1000, 8000], // Clamped to index 0
  ])('clamps %i to consequence %f', (input, expected) => {
    expect(roundConsequenceToNearestConsequenceOption(input)).toBe(expected);
  });
});

describe('roundProbabilityToNearestProbabilityOption', () => {
  it.each([
    [1 / 400, 1 / 400], // index 0 => 20^-2
    [1 / 20, 1 / 20], // index 1 => 20^-1
    [1, 1], // index 2 => 20^0
    [20, 20], // index 3 => 20^1
    [400, 400], // index 4 => 20^2
  ])('returns exact match %i for probability %f', (input, expected) => {
    expect(roundProbabilityToNearestProbabilityOption(input)).toBeCloseTo(
      expected,
      5,
    );
  });

  it.each([
    [0.01, 0.0025], // round to 1/400 (index 0)
    [10, 20], // round to 1/20 (index 3)
  ])('rounds %i to nearest probability %f', (input, expected) => {
    expect(roundProbabilityToNearestProbabilityOption(input)).toBeCloseTo(
      expected,
      5,
    );
  });

  it.each([
    [0.0001, 1 / 400], // clamped to index 0
    [1000, 400], // clamped to index 4
  ])('clamps %i to probability %f', (input, expected) => {
    expect(roundProbabilityToNearestProbabilityOption(input)).toBeCloseTo(
      expected,
      5,
    );
  });
});
