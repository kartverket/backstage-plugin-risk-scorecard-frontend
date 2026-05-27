/**
 * Tests for ComparisonService.
 *
 * Tests comparison logic for v5.x RiSc documents including:
 * - No-change comparison (identical objects)
 * - Field changes (title, scope, description)
 * - Scenario additions and deletions
 * - Scenario reordering (matched by ID)
 * - Action changes within scenarios
 * - Risk value changes
 * - Valuation changes
 * - Non-mandatory field changes (url)
 * - Cross-version comparison with migration
 */

import {
  type RiSc5X,
  type RiSc5XScenario,
  type RiSc5XAction,
  type RiSc5XChange,
  type RiSc5XScenarioChange,
  type RiSc5XActionChange,
  type RiScRiskChange,
  type MigrationStatus,
  ActionStatus,
  ThreatActor,
  Vulnerability,
  ValuationConfidentiality,
  ValuationIntegrity,
  ValuationAvailability,
} from '@internal/backstage-plugin-ros-common';

import {
  compare,
  comparison5X,
  changeForMandatorySimpleProperty,
  changeForNonMandatorySimpleProperty,
  changeForListOfSimpleProperty,
  changeForListOfComplexProperty,
  ComparisonError,
} from '../services/risc/comparison/RiScComparisonService.ts';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const noMigration: MigrationStatus = {
  migrationChanges: false,
  migrationRequiresNewApproval: false,
  migrationVersions: { fromVersion: '5.2', toVersion: '5.2' },
};

type ActionOverrides = Partial<RiSc5XAction['action']> & {
  id?: string;
  title?: string;
};

function makeAction(overrides: ActionOverrides = {}): RiSc5XAction {
  const { title = 'Action 1', id, ID, ...actionOverrides } = overrides;
  return {
    title,
    action: {
      ID: id ?? ID ?? 'action1',
      description: 'Do something',
      status: ActionStatus['Not OK'],
      ...actionOverrides,
    },
  };
}

type ScenarioOverrides = Partial<
  Omit<RiSc5XScenario['scenario'], 'actions'>
> & {
  id?: string;
  title?: string;
  actions?: RiSc5XAction[];
};

function makeScenario(overrides: ScenarioOverrides = {}): RiSc5XScenario {
  const { title = 'Scenario 1', id, ID, ...scenarioOverrides } = overrides;
  return {
    title,
    scenario: {
      ID: id ?? ID ?? 'scenario1',
      description: 'A test scenario',
      threatActors: [ThreatActor['Script kiddie']],
      vulnerabilities: [Vulnerability.Misconfiguration],
      risk: { probability: 1.0, consequence: 1000.0 },
      remainingRisk: { probability: 0.05, consequence: 100.0 },
      actions: [makeAction()],
      ...scenarioOverrides,
    },
  };
}

function makeRiSc5X(overrides: Partial<RiSc5X> = {}): RiSc5X {
  return {
    schemaVersion: '5.2',
    title: 'Test RiSc',
    scope: 'Test scope',
    scenarios: [makeScenario()],
    ...overrides,
  };
}

// ─── Tests: Helper Functions ───────────────────────────────────────────────────

describe('changeForMandatorySimpleProperty', () => {
  it('returns UNCHANGED when values are equal', () => {
    const result = changeForMandatorySimpleProperty('hello', 'hello');
    expect(result.type).toBe('UNCHANGED');
    expect((result as { type: 'UNCHANGED'; value: string }).value).toBe(
      'hello',
    );
  });

  it('returns CHANGED when values differ', () => {
    const result = changeForMandatorySimpleProperty('old', 'new');
    expect(result.type).toBe('CHANGED');
    const changed = result as {
      type: 'CHANGED';
      oldValue: string;
      newValue: string;
    };
    expect(changed.oldValue).toBe('old');
    expect(changed.newValue).toBe('new');
  });

  it('handles number comparisons', () => {
    expect(changeForMandatorySimpleProperty(1.0, 1.0).type).toBe('UNCHANGED');
    expect(changeForMandatorySimpleProperty(1.0, 2.0).type).toBe('CHANGED');
  });
});

describe('changeForNonMandatorySimpleProperty', () => {
  it('returns null when values are equal', () => {
    expect(changeForNonMandatorySimpleProperty('same', 'same')).toBeNull();
  });

  it('returns CHANGED when values differ', () => {
    const result = changeForNonMandatorySimpleProperty('old', 'new');
    expect(result).not.toBeNull();
    expect(result!.type).toBe('CHANGED');
  });

  it('detects null to value change', () => {
    const result = changeForNonMandatorySimpleProperty(null, 'new');
    expect(result).not.toBeNull();
    expect(result!.type).toBe('CHANGED');
  });
});

describe('changeForListOfSimpleProperty', () => {
  it('returns empty for identical lists', () => {
    const result = changeForListOfSimpleProperty(['a', 'b'], ['a', 'b']);
    expect(result).toEqual([]);
  });

  it('detects deletions and additions', () => {
    const result = changeForListOfSimpleProperty(['a', 'b'], ['b', 'c']);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'DELETED', oldValue: 'a' });
    expect(result[1]).toEqual({ type: 'ADDED', newValue: 'c' });
  });

  it('handles empty lists', () => {
    expect(changeForListOfSimpleProperty([], [])).toEqual([]);
    const added = changeForListOfSimpleProperty([], ['x']);
    expect(added).toEqual([{ type: 'ADDED', newValue: 'x' }]);
  });
});

describe('changeForListOfComplexProperty', () => {
  interface Item {
    id: string;
    name: string;
  }

  it('returns empty for identical lists', () => {
    const items: Item[] = [{ id: '1', name: 'a' }];
    const result = changeForListOfComplexProperty(
      items,
      items,
      i => i.id,
      (o, n) => ({ oldName: o.name, newName: n.name }),
    );
    expect(result).toEqual([]);
  });

  it('detects additions', () => {
    const result = changeForListOfComplexProperty<
      { oldName: string; newName: string },
      Item,
      string
    >(
      [],
      [{ id: '1', name: 'a' }],
      i => i.id,
      (o, n) => ({
        oldName: o.name,
        newName: n.name,
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('ADDED');
  });

  it('detects deletions', () => {
    const result = changeForListOfComplexProperty<
      { oldName: string; newName: string },
      Item,
      string
    >(
      [{ id: '1', name: 'a' }],
      [],
      i => i.id,
      (o, n) => ({
        oldName: o.name,
        newName: n.name,
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('DELETED');
  });

  it('detects content changes by key match', () => {
    const result = changeForListOfComplexProperty(
      [{ id: '1', name: 'old' }],
      [{ id: '1', name: 'new' }],
      i => i.id,
      (o, n) => ({ oldName: o.name, newName: n.name }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('CONTENT_CHANGED');
  });
});

// ─── Tests: comparison5X ───────────────────────────────────────────────────────

describe('comparison5X', () => {
  it('returns no changes for identical RiSc objects', () => {
    const risc = makeRiSc5X();
    const result = comparison5X(risc, risc, noMigration);

    expect(result.type).toBe('5.*');
    expect(result.title).toBeNull();
    expect(result.scope).toBeNull();
    expect(result.valuations).toEqual([]);
    expect(result.scenarios).toEqual([]);
    expect(result.migrationChanges).toBe(noMigration);
  });

  it('detects title change', () => {
    const oldRiSc = makeRiSc5X({ title: 'Old Title' });
    const newRiSc = makeRiSc5X({ title: 'New Title' });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.title).not.toBeNull();
    expect(result.title!.type).toBe('CHANGED');
    const changed = result.title as {
      type: 'CHANGED';
      oldValue: string;
      newValue: string;
    };
    expect(changed.oldValue).toBe('Old Title');
    expect(changed.newValue).toBe('New Title');
  });

  it('detects scope change', () => {
    const oldRiSc = makeRiSc5X({ scope: 'Old scope' });
    const newRiSc = makeRiSc5X({ scope: 'New scope' });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.scope).not.toBeNull();
    expect(result.scope!.type).toBe('CHANGED');
  });

  it('detects scenario addition', () => {
    const oldRiSc = makeRiSc5X({ scenarios: [] });
    const newRiSc = makeRiSc5X({ scenarios: [makeScenario()] });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].type).toBe('ADDED');
    const added = result.scenarios[0] as {
      type: 'ADDED';
      newValue: RiSc5XScenario;
    };
    expect(added.newValue.scenario.ID).toBe('scenario1');
  });

  it('detects scenario deletion', () => {
    const oldRiSc = makeRiSc5X({ scenarios: [makeScenario()] });
    const newRiSc = makeRiSc5X({ scenarios: [] });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].type).toBe('DELETED');
  });

  it('matches scenarios by ID, not position (reordering)', () => {
    const scenario1 = makeScenario({ id: 'S1', title: 'First' });
    const scenario2 = makeScenario({ id: 'S2', title: 'Second' });

    const oldRiSc = makeRiSc5X({ scenarios: [scenario1, scenario2] });
    // Reordered — same IDs, same content
    const newRiSc = makeRiSc5X({ scenarios: [scenario2, scenario1] });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    // No changes detected since same IDs with same content
    expect(result.scenarios).toEqual([]);
  });

  it('detects scenario content changes (title change within scenario)', () => {
    const oldScenario = makeScenario({ id: 'S1', title: 'Old Title' });
    const newScenario = makeScenario({ id: 'S1', title: 'New Title' });

    const oldRiSc = makeRiSc5X({ scenarios: [oldScenario] });
    const newRiSc = makeRiSc5X({ scenarios: [newScenario] });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].type).toBe('CONTENT_CHANGED');
    const change = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    expect(change.id).toBe('S1');
    expect(change.title.type).toBe('CHANGED');
  });

  it('detects action changes within a scenario', () => {
    const oldAction = makeAction({ id: 'A1', title: 'Old action title' });
    const newAction = makeAction({ id: 'A1', title: 'New action title' });

    const oldRiSc = makeRiSc5X({
      scenarios: [makeScenario({ actions: [oldAction] })],
    });
    const newRiSc = makeRiSc5X({
      scenarios: [makeScenario({ actions: [newAction] })],
    });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].type).toBe('CONTENT_CHANGED');
    const scenarioChange = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    expect(scenarioChange.actions).toHaveLength(1);
    expect(scenarioChange.actions[0].type).toBe('CONTENT_CHANGED');
    const actionChange = (
      scenarioChange.actions[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XActionChange;
      }
    ).value;
    expect(actionChange.title.type).toBe('CHANGED');
  });

  it('detects risk value changes', () => {
    const oldScenario = makeScenario({
      id: 'S1',
      risk: { probability: 1.0, consequence: 1000.0 },
    });
    const newScenario = makeScenario({
      id: 'S1',
      risk: { probability: 5.0, consequence: 10000.0 },
    });

    const result = comparison5X(
      makeRiSc5X({ scenarios: [newScenario] }),
      makeRiSc5X({ scenarios: [oldScenario] }),
      noMigration,
    );

    expect(result.scenarios).toHaveLength(1);
    const change = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    expect(change.risk.type).toBe('CONTENT_CHANGED');
    const riskChange = (
      change.risk as { type: 'CONTENT_CHANGED'; value: RiScRiskChange }
    ).value;
    expect(riskChange.probability.type).toBe('CHANGED');
    expect(riskChange.consequence.type).toBe('CHANGED');
  });

  it('detects valuation changes', () => {
    const oldRiSc = makeRiSc5X({
      valuations: [
        {
          description: 'Val 1',
          confidentiality: ValuationConfidentiality.Internal,
          integrity: ValuationIntegrity.Expected,
          availability: ValuationAvailability['2 days'],
        },
      ],
    });
    const newRiSc = makeRiSc5X({
      valuations: [
        {
          description: 'Val 2',
          confidentiality: ValuationConfidentiality.Confidential,
          integrity: ValuationIntegrity.Critical,
          availability: ValuationAvailability.Immediate,
        },
      ],
    });
    const result = comparison5X(newRiSc, oldRiSc, noMigration);

    expect(result.valuations).toHaveLength(2);
    expect(result.valuations[0].type).toBe('DELETED');
    expect(result.valuations[1].type).toBe('ADDED');
  });

  it('detects threat actor list changes', () => {
    const oldScenario = makeScenario({
      id: 'S1',
      threatActors: [ThreatActor['Script kiddie']],
    });
    const newScenario = makeScenario({
      id: 'S1',
      threatActors: [ThreatActor['Script kiddie'], ThreatActor.Insider],
    });

    const result = comparison5X(
      makeRiSc5X({ scenarios: [newScenario] }),
      makeRiSc5X({ scenarios: [oldScenario] }),
      noMigration,
    );

    expect(result.scenarios).toHaveLength(1);
    const change = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    expect(change.threatActors).toHaveLength(1);
    expect(change.threatActors[0]).toEqual({
      type: 'ADDED',
      newValue: ThreatActor.Insider,
    });
  });

  it('detects action status change as non-mandatory field', () => {
    const oldAction = makeAction({ id: 'A1', status: ActionStatus['Not OK'] });
    const newAction = makeAction({ id: 'A1', status: ActionStatus.OK });

    const result = comparison5X(
      makeRiSc5X({ scenarios: [makeScenario({ actions: [newAction] })] }),
      makeRiSc5X({ scenarios: [makeScenario({ actions: [oldAction] })] }),
      noMigration,
    );

    const scenarioChange = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    const actionChange = (
      scenarioChange.actions[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XActionChange;
      }
    ).value;
    expect(actionChange.status).not.toBeNull();
    expect(actionChange.status!.type).toBe('CHANGED');
  });

  it('handles multiple scenario additions and deletions together', () => {
    const kept = makeScenario({ id: 'kept', title: 'Kept' });
    const deleted = makeScenario({ id: 'del', title: 'Deleted' });
    const added = makeScenario({ id: 'add', title: 'Added' });

    const result = comparison5X(
      makeRiSc5X({ scenarios: [kept, added] }),
      makeRiSc5X({ scenarios: [kept, deleted] }),
      noMigration,
    );

    // deleted + added (kept is unchanged so excluded)
    expect(result.scenarios).toHaveLength(2);
    const types = result.scenarios.map(s => s.type);
    expect(types).toContain('DELETED');
    expect(types).toContain('ADDED');
  });

  it('detects url change as non-mandatory field', () => {
    const oldScenario = makeScenario({ id: 'S1', url: null });
    const newScenario = makeScenario({ id: 'S1', url: 'https://example.com' });

    const result = comparison5X(
      makeRiSc5X({ scenarios: [newScenario] }),
      makeRiSc5X({ scenarios: [oldScenario] }),
      noMigration,
    );

    const change = (
      result.scenarios[0] as {
        type: 'CONTENT_CHANGED';
        value: RiSc5XScenarioChange;
      }
    ).value;
    expect(change.url).not.toBeNull();
    expect(change.url!.type).toBe('CHANGED');
  });
});

// ─── Tests: compare (entry point with migration) ──────────────────────────────

describe('compare', () => {
  it('throws ComparisonError for unsupported version', () => {
    const risc = {
      schemaVersion: '99.0',
      title: 'x',
      scope: 'x',
      scenarios: [],
    } as any;
    expect(() => compare(risc, risc)).toThrow(ComparisonError);
  });

  it('same-version comparison works without migration', () => {
    const risc = makeRiSc5X();
    const result = compare(risc, risc);
    expect(result.type).toBe('5.*');
    const change = result as RiSc5XChange;
    expect(change.title).toBeNull();
    expect(change.scope).toBeNull();
    expect(change.scenarios).toEqual([]);
  });
});
