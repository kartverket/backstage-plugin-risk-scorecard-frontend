import { ActionStatusOptions } from './constants';
import { Action, RiSc, Scenario } from './types';
import {
  calcRiskCostOfRiSc,
  calcRiskCostOfScenario,
  calcRelevantActionsCount,
} from './risk';
import { RiskMatrixTabs } from '../components/riskMatrix/utils';

function createAction(status: ActionStatusOptions): Action {
  return {
    ID: 'action-1',
    title: 'Test action',
    description: '',
    status,
    url: '',
  };
}

function createScenario(
  overrides: Partial<Scenario> & { actions?: Action[] } = {},
): Scenario {
  return {
    ID: 'scenario-1',
    title: 'Test scenario',
    description: '',
    threatActors: [],
    vulnerabilities: [],
    risk: { summary: '', probability: 10, consequence: 100 },
    remainingRisk: { summary: '', probability: 2, consequence: 50 },
    actions: [],
    ...overrides,
  };
}

describe('calcRiskCostOfScenario', () => {
  test('returns initial risk cost for initialRisk tab', () => {
    const scenario = createScenario();
    // 10 * 100 = 1000
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.initialRisk)).toBe(
      1000,
    );
  });

  test('returns remaining risk cost for remainingRisk tab', () => {
    const scenario = createScenario();
    // 2 * 50 = 100
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.remainingRisk)).toBe(
      100,
    );
  });

  test('returns initial risk when no actions exist (currentRisk tab)', () => {
    const scenario = createScenario({ actions: [] });
    // No relevant actions -> ratio = 0 -> start + (end - start) * 0 = start = 1000
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      1000,
    );
  });

  test('returns remaining risk when all relevant actions are OK (currentRisk tab)', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.OK),
        createAction(ActionStatusOptions.OK),
      ],
    });
    // ratio = 2/2 = 1 -> start + (end - start) * 1 = end = 100
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      100,
    );
  });

  test('interpolates current risk based on completed action ratio', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.OK),
        createAction(ActionStatusOptions.NotOK),
        createAction(ActionStatusOptions.NotOK),
        createAction(ActionStatusOptions.NotOK),
      ],
    });
    // ratio = 1/4 = 0.25
    // start=1000, end=100 -> 1000 + (100-1000)*0.25 = 1000 - 225 = 775
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      775,
    );
  });

  test('ignores "Not relevant" actions in ratio calculation', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.OK),
        createAction(ActionStatusOptions.NotOK),
        createAction(ActionStatusOptions.NotRelevant),
      ],
    });
    // relevant = 2 (OK + NotOK), completed = 1 -> ratio = 0.5
    // 1000 + (100-1000)*0.5 = 1000 - 450 = 550
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      550,
    );
  });

  test('treats all "Not relevant" actions as ratio 0', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.NotRelevant),
        createAction(ActionStatusOptions.NotRelevant),
      ],
    });
    // No relevant actions -> ratio = 0 -> returns start risk = 1000
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      1000,
    );
  });

  test('handles zero risk values', () => {
    const scenario = createScenario({
      risk: { summary: '', probability: 0, consequence: 0 },
      remainingRisk: { summary: '', probability: 0, consequence: 0 },
      actions: [createAction(ActionStatusOptions.OK)],
    });
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.currentRisk)).toBe(
      0,
    );
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.initialRisk)).toBe(
      0,
    );
    expect(calcRiskCostOfScenario(scenario, RiskMatrixTabs.remainingRisk)).toBe(
      0,
    );
  });

  test('throws for unhandled risk type', () => {
    const scenario = createScenario();
    expect(() => calcRiskCostOfScenario(scenario, undefined)).toThrow(
      'Unable to calculate risk cost: unhandled risk type',
    );
  });
});

describe('calcRiskCostOfRiSc', () => {
  test('sums risk cost across all scenarios', () => {
    const riSc: RiSc = {
      schemaVersion: '5.0',
      title: 'Test',
      scope: '',
      scenarios: [
        createScenario({
          ID: 's1',
          risk: { summary: '', probability: 10, consequence: 100 },
          remainingRisk: { summary: '', probability: 2, consequence: 50 },
        }),
        createScenario({
          ID: 's2',
          risk: { summary: '', probability: 5, consequence: 200 },
          remainingRisk: { summary: '', probability: 1, consequence: 100 },
        }),
      ],
    };
    // initialRisk: (10*100) + (5*200) = 1000 + 1000 = 2000
    expect(calcRiskCostOfRiSc(riSc, RiskMatrixTabs.initialRisk)).toBe(2000);
    // remainingRisk: (2*50) + (1*100) = 100 + 100 = 200
    expect(calcRiskCostOfRiSc(riSc, RiskMatrixTabs.remainingRisk)).toBe(200);
  });

  test('returns 0 for empty scenarios list', () => {
    const riSc: RiSc = {
      schemaVersion: '5.0',
      title: 'Empty',
      scope: '',
      scenarios: [],
    };
    expect(calcRiskCostOfRiSc(riSc, RiskMatrixTabs.initialRisk)).toBe(0);
  });

  test('sums current risk across scenarios with actions', () => {
    const riSc: RiSc = {
      schemaVersion: '5.0',
      title: 'Test',
      scope: '',
      scenarios: [
        createScenario({
          ID: 's1',
          risk: { summary: '', probability: 10, consequence: 100 },
          remainingRisk: { summary: '', probability: 2, consequence: 50 },
          actions: [
            createAction(ActionStatusOptions.OK),
            createAction(ActionStatusOptions.NotOK),
          ],
        }),
        createScenario({
          ID: 's2',
          risk: { summary: '', probability: 4, consequence: 200 },
          remainingRisk: { summary: '', probability: 2, consequence: 100 },
          actions: [],
        }),
      ],
    };
    // s1: ratio=0.5, 1000 + (100-1000)*0.5 = 550
    // s2: no actions -> ratio=0, start=800
    expect(calcRiskCostOfRiSc(riSc, RiskMatrixTabs.currentRisk)).toBe(1350);
  });
});

describe('calcRelevantActionsCount', () => {
  test('counts all actions when none are "Not relevant"', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.OK),
        createAction(ActionStatusOptions.NotOK),
      ],
    });
    expect(calcRelevantActionsCount(scenario)).toBe(2);
  });

  test('excludes "Not relevant" actions', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.OK),
        createAction(ActionStatusOptions.NotRelevant),
        createAction(ActionStatusOptions.NotOK),
        createAction(ActionStatusOptions.NotRelevant),
      ],
    });
    expect(calcRelevantActionsCount(scenario)).toBe(2);
  });

  test('returns 0 when all actions are "Not relevant"', () => {
    const scenario = createScenario({
      actions: [
        createAction(ActionStatusOptions.NotRelevant),
        createAction(ActionStatusOptions.NotRelevant),
      ],
    });
    expect(calcRelevantActionsCount(scenario)).toBe(0);
  });

  test('returns 0 for empty actions list', () => {
    const scenario = createScenario({ actions: [] });
    expect(calcRelevantActionsCount(scenario)).toBe(0);
  });
});
