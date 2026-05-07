import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  validate,
  detectVersion,
  parseContent,
  migrate,
  migrateFrom32To33,
  migrateFrom33To40,
  migrateFrom40To41,
  migrateFrom41To42,
  migrateFrom42To50,
  migrateFrom50To51,
  migrateFrom51To52,
  type RiScJson,
} from '../services/SchemaService';
import { RiScVersion } from '@internal/backstage-plugin-ros-common';
import type { MigrationStatus } from '@internal/backstage-plugin-ros-common';

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

// ─── parseContent ──────────────────────────────────────────────────────────────

describe('parseContent', () => {
  it('parses valid JSON', () => {
    const doc = parseContent('{"schemaVersion": "5.2", "title": "T"}');
    expect(doc.schemaVersion).toBe('5.2');
  });

  it('parses valid YAML', () => {
    const doc = parseContent('schemaVersion: "5.2"\ntitle: Test\n');
    expect(doc.schemaVersion).toBe('5.2');
  });

  it('throws on invalid content', () => {
    expect(() => parseContent('{ 1: 1 ')).toThrow();
  });
});

// ─── detectVersion ─────────────────────────────────────────────────────────────

describe('detectVersion', () => {
  it('detects version from parsed document', () => {
    const doc = JSON.parse(loadFixture('3.2.json'));
    expect(detectVersion(doc)).toBe(RiScVersion.V3_2);
  });

  it('returns null for unknown version', () => {
    expect(detectVersion({ schemaVersion: '99.0' })).toBeNull();
  });

  it('returns null if schemaVersion missing', () => {
    expect(detectVersion({ title: 'test' })).toBeNull();
  });
});

// ─── validate ──────────────────────────────────────────────────────────────────

describe('validate', () => {
  it('validates v3.2 against any schema', () => {
    const result = validate(loadFixture('3.2.json'));
    expect(result.valid).toBe(true);
    expect(result.version).toBe('3.2');
  });

  it('validates v3.3 against any schema', () => {
    const result = validate(loadFixture('3.3.json'));
    expect(result.valid).toBe(true);
  });

  it('validates v4.0 against any schema', () => {
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

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    const firstScenario = scenarios[0].scenario as Record<string, unknown>;
    const vulns = firstScenario.vulnerabilities as string[];

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

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    const firstScenario = scenarios[0].scenario as Record<string, unknown>;
    const actions = firstScenario.actions as Array<Record<string, unknown>>;

    for (const actionWrapper of actions) {
      const action = actionWrapper.action as Record<string, unknown>;
      expect(action.owner).toBeUndefined();
      expect(action.deadline).toBeUndefined();
    }
  });

  it('removes existingActions field', () => {
    const doc = JSON.parse(loadFixture('3.3.json'));
    const [migrated, _] = migrateFrom33To40(doc, emptyStatus());

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    const firstScenario = scenarios[0].scenario as Record<string, unknown>;
    expect(firstScenario.existingActions).toBeUndefined();
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
    const doc = JSON.parse(loadFixture('4.0.json'));
    const [migrated, status] = migrateFrom40To41(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('4.1');
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationRequiresNewApproval).toBe(true);

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;

    // First scenario: prob 0.1->0.05, cons 30000->160000
    const s1 = scenarios[0].scenario as Record<string, unknown>;
    const risk1 = s1.risk as Record<string, number>;
    expect(risk1.probability).toBe(0.05);
    expect(risk1.consequence).toBe(160000);
    const rem1 = s1.remainingRisk as Record<string, number>;
    expect(rem1.probability).toBe(0.0025);
    expect(rem1.consequence).toBe(8000);

    // Second scenario: prob 50->20, cons 30000000->64000000
    const s2 = scenarios[1].scenario as Record<string, unknown>;
    const risk2 = s2.risk as Record<string, number>;
    expect(risk2.probability).toBe(20);
    expect(risk2.consequence).toBe(64000000);

    // Third scenario: prob 300->400, cons 1000000000->1280000000
    const s3 = scenarios[2].scenario as Record<string, unknown>;
    const risk3 = s3.risk as Record<string, number>;
    expect(risk3.probability).toBe(400);
    expect(risk3.consequence).toBe(1280000000);

    // Arbitrary values remain unchanged
    const rem3 = s3.remainingRisk as Record<string, number>;
    expect(rem3.probability).toBe(0.123);
    expect(rem3.consequence).toBe(198000);
  });

  it('tracks changes for all scenarios', () => {
    const doc = JSON.parse(loadFixture('4.0.json'));
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

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    for (const sw of scenarios) {
      const scenario = sw.scenario as Record<string, unknown>;
      const actions = scenario.actions as Array<Record<string, unknown>>;
      for (const aw of actions) {
        const action = aw.action as Record<string, unknown>;
        expect(action.lastUpdated).toBe('2025-07-09T11:28:14.801Z');
      }
    }
  });

  it('sets lastUpdated to null when no lastPublished', () => {
    const doc = JSON.parse(loadFixture('4.1.json'));
    const [migrated, _] = migrateFrom41To42(doc, null, emptyStatus());

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    const s1 = scenarios[0].scenario as Record<string, unknown>;
    const actions = s1.actions as Array<Record<string, unknown>>;
    const action = actions[0].action as Record<string, unknown>;
    expect(action.lastUpdated).toBeNull();
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

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;

    // "Not started" -> "Not OK"
    const s1 = scenarios[0].scenario as Record<string, unknown>;
    const a1 = (s1.actions as Array<Record<string, unknown>>)[0]
      .action as Record<string, unknown>;
    expect(a1.status).toBe('Not OK');

    // "Not started" -> "Not OK"
    const s2 = scenarios[1].scenario as Record<string, unknown>;
    const a2 = (s2.actions as Array<Record<string, unknown>>)[0]
      .action as Record<string, unknown>;
    expect(a2.status).toBe('Not OK');

    // "Completed" -> "OK"
    const s3 = scenarios[2].scenario as Record<string, unknown>;
    const a3 = (s3.actions as Array<Record<string, unknown>>)[0]
      .action as Record<string, unknown>;
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

    const scenarios = migrated.scenarios as Array<Record<string, unknown>>;
    const s1 = scenarios[0].scenario as Record<string, unknown>;
    const actions = s1.actions as Array<Record<string, unknown>>;
    const a1 = actions[0].action as Record<string, unknown>;
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
    const doc: RiScJson = {
      schemaVersion: '5.1',
      title: 'Test',
      scope: 'Test',
      valuations: [{ description: 'test' }],
      scenarios: [],
    };
    const [migrated, status] = migrateFrom51To52(doc, emptyStatus());

    expect(migrated.schemaVersion).toBe('5.2');
    expect(migrated.valuations).toBeUndefined();
    expect(status.migrationChanges).toBe(true);
    expect(status.migrationChanges52).toEqual({ removedValuationsCount: 1 });
  });

  it('handles empty valuations', () => {
    const doc: RiScJson = {
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
    const doc: RiScJson = {
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
    const doc: RiScJson = {
      schemaVersion: '4.2',
      title: 'T',
      scope: 'S',
      valuations: [],
      scenarios: [],
    };

    expect(() => migrate(doc, null, '3.3')).toThrow();
  });

  it('throws on unsupported version', () => {
    const doc: RiScJson = { schemaVersion: '99.0', title: 'T', scope: 'S' };
    expect(() => migrate(doc, null, '5.2')).toThrow();
  });

  it('throws on unsupported target version', () => {
    const doc: RiScJson = {
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
