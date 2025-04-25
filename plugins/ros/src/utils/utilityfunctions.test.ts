import { Action, RiSc, RiScWithMetadata, Scenario } from './types';
import {
  UpdatedStatusEnum,
  calculateDaysSince,
  calculateUpdatedStatus,
  deleteScenario,
  formatNOK,
  formatNumber,
  generateRandomId,
  isDeeplyEqual,
  requiresNewApproval,
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
    expect(formatNOK(1000)).toBe('1 000');
    expect(formatNOK(1000000)).toBe('1 000 000');
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
  it('returns VERY_OUTDATED if any input is null', () => {
    expect(calculateUpdatedStatus(null, 10)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
    expect(calculateUpdatedStatus(10, null)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits > 50', () => {
    expect(calculateUpdatedStatus(10, 51)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits between 11 and 25', () => {
    expect(calculateUpdatedStatus(30, 15)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(90, 15)).toBe(
      UpdatedStatusEnum.LITTLE_OUTDATED,
    );
    expect(calculateUpdatedStatus(180, 15)).toBe(UpdatedStatusEnum.OUTDATED);
    expect(calculateUpdatedStatus(200, 15)).toBe(
      UpdatedStatusEnum.VERY_OUTDATED,
    );
  });

  it('returns correct status for commits <= 10', () => {
    expect(calculateUpdatedStatus(30, 5)).toBe(UpdatedStatusEnum.UPDATED);
    expect(calculateUpdatedStatus(61, 5)).toBe(
      UpdatedStatusEnum.LITTLE_OUTDATED,
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
    valuations: [
      {
        description: 'Valuation 1',
        confidentiality: 'High',
        integrity: 'Medium',
        availability: 'Low',
      },
    ],
  };

  it('returns false if scenarios are equal', () => {
    expect(requiresNewApproval(riSc, riSc)).toBe(false);
  });

  it('returns false if diff on title, description, summary, action.description, or action.status', () => {
    const updatedScenario = {
      ...scenario,
      risk: { ...scenario.risk, summary: 'New summary' },
      remainingRisk: { ...scenario.remainingRisk, summary: 'New summary' },
    };
    const updatedRiSc = {
      ...riSc,
      title: 'New title',
      scenarios: [updatedScenario],
    };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(false);
  });

  it('returns false for any diff in action', () => {
    const updatedScenario = {
      ...scenario,
      actions: [
        {
          ...action,
          description: 'New description',
          status: 'New status',
          title: 'New title',
          url: 'New url',
          ID: 'New ID',
        },
      ],
    };
    const updatedRiSc = {
      ...riSc,
      scenarios: [updatedScenario],
    };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(false);
  });

  it('returns true if number of actions differ', () => {
    const updatedScenario = {
      ...scenario,
      actions: [action, action, action],
    };
    const updatedRiSc = {
      ...riSc,
      scenarios: [updatedScenario],
    };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(true);
  });

  it('returns true if diff on threatActors', () => {
    const updatedScenario = { ...scenario, threatActors: ['actor2'] };
    const updatedRiSc = { ...riSc, scenarios: [updatedScenario] };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(true);
  });

  it('returns true if diff on risk', () => {
    const updatedScenario = {
      ...scenario,
      risk: { ...scenario.risk, probability: 5 },
    };
    const updatedRiSc = { ...riSc, scenarios: [updatedScenario] };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(true);
  });

  it('returns true if diff on remaining risk', () => {
    const updatedScenario = {
      ...scenario,
      remainingRisk: { ...scenario.remainingRisk, consequence: 5 },
    };
    const updatedRiSc = { ...riSc, scenarios: [updatedScenario] };
    expect(requiresNewApproval(riSc, updatedRiSc)).toBe(true);
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

describe('deleteAction', () => {});

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
