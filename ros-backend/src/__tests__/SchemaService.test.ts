import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  validate,
  parseContent,
  getVersion,
  migrate,
  migrateFrom32To33,
  migrateFrom33To40,
  migrateFrom40To41,
  migrateFrom41To42,
  migrateFrom42To50,
  migrateFrom50To51,
  migrateFrom51To52,
} from '../services/risc/schema/SchemaService.ts';
import type {
  MigrationStatus,
  RiScDocument,
  RiSc5X,
} from '@internal/backstage-plugin-ros-common';

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, 'fixtures', name), 'utf-8');
}

function emptyStatus(): MigrationStatus {
  return {
    migrationChanges: false,
    migrationRequiresNewApproval: false,
    migrationVersions: { fromVersion: null, toVersion: null },
  };
}

function load40FixtureWithKnownRiskValues() {
  const doc = JSON.parse(loadFixture('4.0.json'));
  doc.scenarios[2].scenario.remainingRisk.probability = 1;
  doc.scenarios[2].scenario.remainingRisk.consequence = 1000000;
  return doc;
}

// ─── parseContent ──────────────────────────────────────────────────────────────

describe('parseContent', () => {
  it('parses and validates valid JSON', () => {
    const doc = parseContent(
      '{"schemaVersion": "5.2", "title": "T", "scope": "S", "scenarios": []}',
    );
    expect(doc.schemaVersion).toBe('5.2');
  });

  it('parses and validates valid YAML', () => {
    const doc = parseContent(
      'schemaVersion: "5.2"\ntitle: Test\nscope: Test scope\nscenarios: []\n',
    );
    expect(doc.schemaVersion).toBe('5.2');
  });

  it('throws on invalid content', () => {
    expect(() => parseContent('{ 1: 1 ')).toThrow();
  });

  it('throws when content parses but does not match a RiSc schema', () => {
    expect(() =>
      parseContent('{"schemaVersion": "5.2", "title": "T"}'),
    ).toThrow('RiSc schema validation failed');
  });

  it('throws when schemaVersion is unknown even if the shape is otherwise valid', () => {
    expect(() =>
      parseContent(
        '{"schemaVersion": "99.0", "title": "T", "scope": "S", "scenarios": []}',
      ),
    ).toThrow("Version '99.0' is not known");
  });
});

// ─── validate ──────────────────────────────────────────────────────────────────

describe('validate', () => {
  it('validates v3.2 against its declared schema version', () => {
    const result = validate(loadFixture('3.2.json'));
    expect(result.valid).toBe(true);
    expect(result.version).toBe('3.2');
  });

  it('validates v3.3 against its declared schema version', () => {
    const result = validate(loadFixture('3.3.json'));
    expect(result.valid).toBe(true);
  });

  it('validates v4.0 against its declared schema version', () => {
    const result = validate(loadFixture('4.0.json'));
    expect(result.valid).toBe(true);
  });

  it('validates v4.0 against specific schema', () => {
    const result = validate(loadFixture('4.0.json'), '4.0');
    expect(result.valid).toBe(true);
  });

  it('fails v4.0 content against v3.3 schema', () => {
    const result = validate(loadFixture('4.0.json'), '3.3');
    expect(result.valid).toBe(false);
  });

  it('fails v3.3 content against v4.0 schema', () => {
    const result = validate(loadFixture('3.3.json'), '4.0');
    expect(result.valid).toBe(false);
  });

  it('returns invalid for null-like content', () => {
    const result = validate('not json or yaml at all {[');
    expect(result.valid).toBe(false);
  });

  it('validates YAML input', () => {
    const yamlContent = `schemaVersion: "5.2"
title: Test
scope: Test scope
scenarios: []`;
    const result = validate(yamlContent, '5.2');
    expect(result.valid).toBe(true);
  });

  it('returns error for unknown schema version', () => {
    const result = validate('{"schemaVersion": "1.0"}', '99.0');
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

// ─── Migration: 3.2 → 3.3 ─────────────────────────────────────────────────────

describe('migrateFrom32To33', () => {
  it('bumps schema version to 3.3 without other changes', () => {
    const doc = JSON.parse(loadFixture('3.2.json'));
    const [migrated, _status] = migrateFrom32To33(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('3.3');
    // Everything else should be the same
    expect(migrated.title).toBe(doc.title);
    expect(migrated.scenarios).toEqual(doc.scenarios);
  });
});

// ─── Migration: 3.3 → 4.0 ─────────────────────────────────────────────────────

describe('migrateFrom33To40', () => {
  it('bumps schema version to 4.0', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [migrated, status] = migrateFrom33To40(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.0');
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationRequiresNewApproval).toBe(true);
  });

  it('replaces vulnerability enums', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [migrated, _] = migrateFrom33To40(doc, emptyStatus());

    const vulns = migrated.scenarios[0].scenario.vulnerabilities;

    // User repudiation -> Unmonitored use
    // Compromised admin user + Escalation of rights -> Unauthorized access (deduped)
    // Disclosed secret -> Information leak (deduped with existing)
    // Denial of service -> Excessive use
    // Misconfiguration stays
    expect(vulns).toContain('Unmonitored use');
    expect(vulns).toContain('Unauthorized access');
    expect(vulns).toContain('Information leak');
    expect(vulns).toContain('Excessive use');
    expect(vulns).toContain('Misconfiguration');
    expect(vulns).not.toContain('User repudiation');
    expect(vulns).not.toContain('Compromised admin user');
  });

  it('removes owner and deadline from actions', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [migrated, _] = migrateFrom33To40(doc, emptyStatus());

    const actions = migrated.scenarios[0].scenario.actions;

    for (const actionWrapper of actions) {
      const action = actionWrapper.action;
      expect('owner' in action).toBe(false);
      expect('deadline' in action).toBe(false);
    }
  });

  it('removes existingActions field', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [migrated, _] = migrateFrom33To40(doc, emptyStatus());

    expect('existingActions' in migrated.scenarios[0].scenario).toBe(false);
  });

  it('tracks migration changes', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [_, status] = migrateFrom33To40(doc, emptyStatus());

    expect(status.migrationChanges40).toBeDefined();
    expect(status.migrationChanges40!.scenarios.length).toBe(1);

    const changed = status.migrationChanges40!.scenarios[0];
    expect(changed.id).toBe('14Kap');
    expect(changed.removedExistingActions).toBe('Ddos protection. ');
    expect(changed.changedActions.length).toBe(1);
    expect(changed.changedActions[0].removedOwner).toBe('Kåre');
    expect(changed.changedActions[0].removedDeadline).toBe('2024-06-12');
    expect(changed.changedVulnerabilities.length).toBe(5);
  });

  it('tracks action-only migration changes', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const scenario = doc.scenarios[0].scenario;
    delete scenario.existingActions;
    scenario.vulnerabilities = ['Misconfiguration'];

    const [_, status] = migrateFrom33To40(doc, emptyStatus());

    expect(status.migrationChanges40!.scenarios).toHaveLength(1);
    expect(status.migrationChanges40!.scenarios[0].changedActions).toHaveLength(
      1,
    );
    expect(
      status.migrationChanges40!.scenarios[0].changedVulnerabilities,
    ).toHaveLength(0);
  });

  it('tracks vulnerability-only migration changes', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const scenario = doc.scenarios[0].scenario;
    delete scenario.existingActions;
    for (const actionWrapper of scenario.actions) {
      delete actionWrapper.action.owner;
      delete actionWrapper.action.deadline;
    }

    const [_, status] = migrateFrom33To40(doc, emptyStatus());

    expect(status.migrationChanges40!.scenarios).toHaveLength(1);
    expect(status.migrationChanges40!.scenarios[0].changedActions).toHaveLength(
      0,
    );
    expect(
      status.migrationChanges40!.scenarios[0].changedVulnerabilities.length,
    ).toBeGreaterThan(0);
  });

  it('handles no scenarios gracefully', () => {
    const doc = JSON.parse(loadFixture('3.3-no-scenarios.json'));
    const [migrated, status] = migrateFrom33To40(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.0');
    expect(status.migrationChanges40).toBeNull();
  });
});

// ─── Migration: 4.0 → 4.1 ─────────────────────────────────────────────────────

describe('migrateFrom40To41', () => {
  it('bumps schema version and remaps risk values', () => {
    const doc = load40FixtureWithKnownRiskValues();
    const [migrated, status] = migrateFrom40To41(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.1');
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationRequiresNewApproval).toBe(true);

    // First scenario: prob 0.1->0.05, cons 30000->160000
    const s1 = migrated.scenarios[0].scenario;
    const risk1 = s1.risk;
    expect(risk1.probability).toBe(0.05);
    expect(risk1.consequence).toBe(160000);
    const rem1 = s1.remainingRisk;
    expect(rem1.probability).toBe(0.0025);
    expect(rem1.consequence).toBe(8000);

    // Second scenario: prob 50->20, cons 30000000->64000000
    const s2 = migrated.scenarios[1].scenario;
    const risk2 = s2.risk;
    expect(risk2.probability).toBe(20);
    expect(risk2.consequence).toBe(64000000);

    // Third scenario: prob 300->400, cons 1000000000->1280000000
    const s3 = migrated.scenarios[2].scenario;
    const risk3 = s3.risk;
    expect(risk3.probability).toBe(400);
    expect(risk3.consequence).toBe(1280000000);

    // Third scenario remaining risk: prob 1->1, cons 1000000->3200000
    const rem3 = s3.remainingRisk;
    expect(rem3.probability).toBe(1);
    expect(rem3.consequence).toBe(3200000);
  });

  it('tracks changes for all scenarios', () => {
    const doc = load40FixtureWithKnownRiskValues();
    const [_, status] = migrateFrom40To41(doc, emptyStatus());

    expect(status.migrationChanges41).toBeDefined();
    expect(status.migrationChanges41!.scenarios.length).toBe(3);

    const s1 = status.migrationChanges41!.scenarios[0];
    expect(s1.changedRiskProbability).toEqual({
      oldValue: 0.1,
      newValue: 0.05,
    });
    expect(s1.changedRiskConsequence).toEqual({
      oldValue: 30000,
      newValue: 160000,
    });
  });

  it('throws when a risk value has no 4.0 to 4.1 mapping', () => {
    const doc = JSON.parse(loadFixture('4.0.json'));

    expect(() => migrateFrom40To41(doc, emptyStatus())).toThrow(
      'No mapping exists for 0.123',
    );
  });
});

// ─── Migration: 4.1 → 4.2 ─────────────────────────────────────────────────────

describe('migrateFrom41To42', () => {
  const lastPublished = {
    dateTime: '2025-07-09T11:28:14.801Z',
    numberOfCommits: 3,
  };

  it('adds lastUpdated to actions', () => {
    const doc = JSON.parse(loadFixture('4.1.json'));
    const [migrated, _] = migrateFrom41To42(doc, lastPublished, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.2');

    for (const sw of migrated.scenarios) {
      const actions = sw.scenario.actions;
      for (const aw of actions) {
        const action = aw.action;
        expect(action.lastUpdated).toBe('2025-07-09T11:28:14.801Z');
      }
    }
  });

  it('omits lastUpdated when no lastPublished', () => {
    const doc = JSON.parse(loadFixture('4.1.json'));
    const [migrated, _] = migrateFrom41To42(doc, null, emptyStatus());

    const action = migrated.scenarios[0].scenario.actions[0].action;
    expect('lastUpdated' in action).toBe(false);
  });

  it('handles no actions', () => {
    const doc = JSON.parse(loadFixture('4.1-no-actions.json'));
    const [migrated, status] = migrateFrom41To42(doc, null, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.2');
    expect(status.migrationChanges42).toBeNull();
  });

  it('tracks changes', () => {
    const doc = JSON.parse(loadFixture('4.1.json'));
    const [_, status] = migrateFrom41To42(doc, lastPublished, emptyStatus());

    expect(status.migrationChanges42).toBeDefined();
    expect(status.migrationChanges42!.scenarios.length).toBe(3);
    expect(
      status.migrationChanges42!.scenarios[0].changedActions[0].lastUpdated,
    ).toBe('2025-07-09T11:28:14.801Z');
  });
});

// ─── Migration: 4.2 → 5.0 ─────────────────────────────────────────────────────

describe('migrateFrom42To50', () => {
  it('maps action statuses correctly', () => {
    const doc = JSON.parse(loadFixture('4.2.json'));
    const [migrated, status] = migrateFrom42To50(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.0');
    expect(status.migrationChanges).toBe(true);

    // "Not started" -> "Not OK"
    const a1 = migrated.scenarios[0].scenario.actions[0].action;
    expect(a1.status).toBe('Not OK');

    // "Not started" -> "Not OK"
    const a2 = migrated.scenarios[1].scenario.actions[0].action;
    expect(a2.status).toBe('Not OK');

    // "Completed" -> "OK"
    const a3 = migrated.scenarios[2].scenario.actions[0].action;
    expect(a3.status).toBe('OK');
  });

  it('handles no actions', () => {
    const doc = JSON.parse(loadFixture('4.2-no-actions.json'));
    const [migrated, status] = migrateFrom42To50(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.0');
    expect(status.migrationChanges50).toBeNull();
  });

  it('tracks changed action statuses', () => {
    const doc = JSON.parse(loadFixture('4.2.json'));
    const [_, status] = migrateFrom42To50(doc, emptyStatus());

    expect(status.migrationChanges50).toBeDefined();
    expect(status.migrationChanges50!.scenarios.length).toBeGreaterThan(0);
  });
});

// ─── Migration: 5.0 → 5.1 ─────────────────────────────────────────────────────

describe('migrateFrom50To51', () => {
  it('adds lastUpdatedBy to actions', () => {
    const doc = JSON.parse(loadFixture('5.0.json'));
    const [migrated, status] = migrateFrom50To51(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.1');
    expect(status.migrationChanges).toBe(true);

    const a1 = migrated.scenarios[0].scenario.actions[0].action;
    expect(a1.lastUpdatedBy).toBe('');
  });

  it('tracks changes', () => {
    const doc = JSON.parse(loadFixture('5.0.json'));
    const [_, status] = migrateFrom50To51(doc, emptyStatus());

    expect(status.migrationChanges51).toBeDefined();
    expect(status.migrationChanges51!.scenarios.length).toBe(3);
  });
});

// ─── Migration: 5.1 → 5.2 ─────────────────────────────────────────────────────

describe('migrateFrom51To52', () => {
  it('removes valuations', () => {
    const doc: RiSc5X = {
      schemaVersion: '5.1',
      title: 'Test',
      scope: 'Test',
      valuations: [
        {
          description: 'test',
          confidentiality: 'Internal',
          integrity: 'Expected',
          availability: '2 days',
        },
      ],
      scenarios: [],
    };
    const [migrated, status] = migrateFrom51To52(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.2');
    expect(migrated.valuations).toBeUndefined();
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationChanges52).toEqual({ removedValuationsCount: 1 });
  });

  it('handles empty valuations', () => {
    const doc: RiSc5X = {
      schemaVersion: '5.1',
      title: 'Test',
      scope: 'Test',
      valuations: [],
      scenarios: [],
    };
    const [migrated, status] = migrateFrom51To52(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.2');
    expect(status.migrationChanges).toBe(false);
    expect(status.migrationChanges52).toEqual({ removedValuationsCount: 0 });
  });
});

// ─── Full migration chain ──────────────────────────────────────────────────────

describe('migrate (full chain)', () => {
  it('migrates 3.2 all the way to 5.2', () => {
    const doc = JSON.parse(loadFixture('3.2.json'));
    const lastPublished = {
      dateTime: '2025-07-09T11:28:14.801Z',
      numberOfCommits: 3,
    };

    const [migrated, status] = migrate(doc, lastPublished, '5.2');

    expect(migrated.schemaVersion).toBe('5.2');
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationRequiresNewApproval).toBe(true);
    expect(status.migrationVersions.fromVersion).toBe('3.2');
    expect(status.migrationVersions.toVersion).toBe('5.2');

    // Changes should be tracked for various versions
    expect(status.migrationChanges40).toBeDefined();
    expect(status.migrationChanges41).toBeDefined();
    expect(status.migrationChanges52).toBeDefined();
  });

  it('no-op when already at target version', () => {
    const doc: RiScDocument = {
      schemaVersion: '5.2',
      title: 'Test',
      scope: 'Test',
      scenarios: [],
    };

    const [migrated, status] = migrate(doc, null, '5.2');
    expect(migrated).toEqual(doc);
    expect(status.migrationChanges).toBe(false);
  });

  it('throws on backwards migration', () => {
    const doc: RiScDocument = {
      schemaVersion: '4.2',
      title: 'T',
      scope: 'S',
      valuations: [],
      scenarios: [],
    };

    expect(() => migrate(doc, null, '3.3')).toThrow();
  });

  it('throws on unsupported version', () => {
    expect(() => getVersion('99.0')).toThrow();
  });

  it('throws on unsupported target version', () => {
    const doc: RiScDocument = {
      schemaVersion: '3.2',
      title: 'T',
      scope: 'S',
      valuations: [],
      scenarios: [],
    };
    expect(() => migrate(doc, null, '0.0')).toThrow();
  });

  it('migrates 3.2 fixture to produce expected 4.0 changes', () => {
    const doc = JSON.parse(loadFixture('3.2.json'));
    const lastPublished = {
      dateTime: '2025-07-09T11:28:14.801Z',
      numberOfCommits: 3,
    };
    const [_, status] = migrate(doc, lastPublished, '5.2');

    // From the Kotlin test: the 3.2 fixture has "Denial of service" which maps to "Excessive use"
    const changes40 = status.migrationChanges40!;
    expect(changes40.scenarios.length).toBe(1);
    expect(changes40.scenarios[0].id).toBe('14Kap');
    expect(changes40.scenarios[0].removedExistingActions).toBe(
      'Ddos protection. ',
    );
    expect(changes40.scenarios[0].changedActions[0].removedOwner).toBe('Kåre');
  });
});
