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
  migrateFrom52To53,
  migrateFrom53To54,
} from '../services/SchemaService';
import {
  latestSupportedVersion,
  type MigrationStatus,
  type RiScDocument,
  type RiSc5X,
} from '@kartverket/ros-common';

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

  it('validates v5.3 with unencryptedMetadata appliesTo', () => {
    const result = validate(
      JSON.stringify({
        schemaVersion: '5.3',
        title: 'T',
        scope: 'S',
        unencryptedMetadata: {
          appliesTo: [
            'backstage:component:default/service-a',
            'backstage:component:default/service-b',
          ],
        },
        scenarios: [],
      }),
      '5.3',
    );

    expect(result.valid).toBe(true);
  });

  it('rejects duplicate v5.3 appliesTo entries', () => {
    const result = validate(
      JSON.stringify({
        schemaVersion: '5.3',
        title: 'T',
        scope: 'S',
        unencryptedMetadata: {
          appliesTo: [
            'backstage:component:default/service-a',
            'backstage:component:default/service-a',
          ],
        },
        scenarios: [],
      }),
      '5.3',
    );

    expect(result.valid).toBe(false);
  });

  it('validates v5.4 action comments', () => {
    const result = validate(
      JSON.stringify({
        schemaVersion: '5.4',
        title: 'T',
        scope: 'S',
        scenarios: [
          {
            title: 'Scenario',
            scenario: {
              ID: 'scen1',
              description: 'Description',
              threatActors: [],
              vulnerabilities: [],
              risk: { probability: 1, consequence: 8000 },
              remainingRisk: { probability: 0.05, consequence: 8000 },
              actions: [
                {
                  title: 'Action',
                  action: {
                    ID: 'act01',
                    description: 'Description',
                    status: 'Not OK',
                    comment: 'Needs follow-up',
                  },
                },
              ],
            },
          },
        ],
      }),
      '5.4',
    );

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

    expect(migrated.scenarios[0].scenario.vulnerabilities).toEqual([
      'Unmonitored use',
      'Unauthorized access',
      'Information leak',
      'Excessive use',
      'Misconfiguration',
    ]);
    expect(migrated.scenarios[1].scenario.vulnerabilities).toEqual([
      'Misconfiguration',
    ]);
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

    expect(status.migrationChanges40).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          removedExistingActions: 'Ddos protection. ',
          changedVulnerabilities: [
            {
              oldValue: 'User repudiation',
              newValue: 'Unmonitored use',
            },
            {
              oldValue: 'Compromised admin user',
              newValue: 'Unauthorized access',
            },
            {
              oldValue: 'Escalation of rights',
              newValue: 'Unauthorized access',
            },
            {
              oldValue: 'Disclosed secret',
              newValue: 'Information leak',
            },
            {
              oldValue: 'Denial of service',
              newValue: 'Excessive use',
            },
          ],
          changedActions: [
            {
              title: 'Innlogging',
              id: 'w100Q',
              removedOwner: 'Kåre',
              removedDeadline: '2024-06-12',
            },
          ],
        },
      ],
    });
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

    expect(status.migrationChanges41).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          changedRiskProbability: { oldValue: 0.1, newValue: 0.05 },
          changedRiskConsequence: { oldValue: 30000, newValue: 160000 },
          changedRemainingRiskProbability: { oldValue: 0.01, newValue: 0.0025 },
          changedRemainingRiskConsequence: { oldValue: 1000, newValue: 8000 },
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '25FcD',
          changedRiskProbability: { oldValue: 50, newValue: 20 },
          changedRiskConsequence: {
            oldValue: 30000000,
            newValue: 64000000,
          },
          changedRemainingRiskProbability: null,
          changedRemainingRiskConsequence: {
            oldValue: 1000000,
            newValue: 3200000,
          },
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '2dsFd',
          changedRiskProbability: { oldValue: 300, newValue: 400 },
          changedRiskConsequence: {
            oldValue: 1000000000,
            newValue: 1280000000,
          },
          changedRemainingRiskProbability: null,
          changedRemainingRiskConsequence: {
            oldValue: 1000000,
            newValue: 3200000,
          },
        },
      ],
    });
  });

  it('throws when a 4.0 risk value is outside the supported migration scale', () => {
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
    const [migrated, status] = migrateFrom41To42(doc, null, emptyStatus());

    for (const sw of migrated.scenarios) {
      const action = sw.scenario.actions[0].action;
      expect('lastUpdated' in action).toBe(false);
    }
    expect(status.migrationChanges42).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          changedActions: [{ title: '', id: 'w100Q' }],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '25FcD',
          changedActions: [{ title: '', id: 'w100Q' }],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '2dsFd',
          changedActions: [{ title: '', id: 'w100Q' }],
        },
      ],
    });
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

    expect(status.migrationChanges42).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              lastUpdated: '2025-07-09T11:28:14.801Z',
            },
          ],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '25FcD',
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              lastUpdated: '2025-07-09T11:28:14.801Z',
            },
          ],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '2dsFd',
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              lastUpdated: '2025-07-09T11:28:14.801Z',
            },
          ],
        },
      ],
    });
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

    expect(status.migrationChanges50).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          changedActionStatus: [
            { oldValue: 'Not started', newValue: 'Not OK' },
          ],
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              changedActionStatus: {
                oldValue: 'Not started',
                newValue: 'Not OK',
              },
            },
          ],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '25FcD',
          changedActionStatus: [
            { oldValue: 'Not started', newValue: 'Not OK' },
          ],
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              changedActionStatus: {
                oldValue: 'Not started',
                newValue: 'Not OK',
              },
            },
          ],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '2dsFd',
          changedActionStatus: [{ oldValue: 'Completed', newValue: 'OK' }],
          changedActions: [
            {
              title: '',
              id: 'w100Q',
              changedActionStatus: {
                oldValue: 'Completed',
                newValue: 'OK',
              },
            },
          ],
        },
      ],
    });
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

    expect(status.migrationChanges51).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          changedActions: [{ title: '', id: 'w100Q', lastUpdatedBy: '' }],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '25FcD',
          changedActions: [{ title: '', id: 'w100Q', lastUpdatedBy: '' }],
        },
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '2dsFd',
          changedActions: [{ title: '', id: 'w100Q', lastUpdatedBy: '' }],
        },
      ],
    });
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

// ─── Migration: 5.2 → 5.3 ─────────────────────────────────────────────────────

describe('migrateFrom52To53', () => {
  it('only bumps schema version to 5.3', () => {
    const doc: RiSc5X = {
      schemaVersion: '5.2',
      title: 'Test',
      scope: 'Test',
      scenarios: [],
    };
    const status = emptyStatus();

    const [migrated, migratedStatus] = migrateFrom52To53(doc, status);

    expect(migrated.schemaVersion).toBe('5.3');
    expect({ ...migrated, schemaVersion: '5.2' }).toEqual(doc);
    expect(migratedStatus).toBe(status);
  });
});

// ─── Migration: 5.3 → 5.4 ─────────────────────────────────────────────────────

describe('migrateFrom53To54', () => {
  it('only bumps schema version to 5.4', () => {
    const doc: RiSc5X = {
      schemaVersion: '5.3',
      title: 'Test',
      scope: 'Test',
      unencryptedMetadata: {
        appliesTo: ['backstage:component:default/service-a'],
      },
      scenarios: [],
    };
    const status = emptyStatus();

    const [migrated, migratedStatus] = migrateFrom53To54(doc, status);

    expect(migrated.schemaVersion).toBe('5.4');
    expect({ ...migrated, schemaVersion: '5.3' }).toEqual(doc);
    expect(migratedStatus).toBe(status);
  });
});

// ─── Full migration chain ──────────────────────────────────────────────────────

describe('migrate (full chain)', () => {
  it('migrates 3.2 all the way to the latest supported version', () => {
    const doc = JSON.parse(loadFixture('3.2.json'));
    const lastPublished = {
      dateTime: '2025-07-09T11:28:14.801Z',
      numberOfCommits: 3,
    };

    const [migrated, status] = migrate(doc, lastPublished);

    expect(migrated).toEqual({
      schemaVersion: latestSupportedVersion,
      title: 'Transformasjon',
      scope: 'Sikkerhet av backend.',
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          scenario: {
            ID: '14Kap',
            description:
              'Ondsinnet bruer ønsker å ta ned løsningen for å lage kaos hos kartveket.',
            threatActors: ['Organised crime'],
            vulnerabilities: ['Input tampering', 'Excessive use'],
            risk: {
              summary: '',
              probability: 1,
              consequence: 8000,
            },
            actions: [
              {
                title: 'Innlogging',
                action: {
                  ID: 'w100Q',
                  description: 'Innlogging. ',
                  status: 'Not OK',
                  lastUpdated: '2025-07-09T11:28:14.801Z',
                  lastUpdatedBy: '',
                },
              },
            ],
            remainingRisk: {
              summary: '',
              probability: 0.05,
              consequence: 8000,
            },
          },
        },
      ],
    });

    expect(status).toEqual({
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationVersions: {
        fromVersion: '3.2',
        toVersion: latestSupportedVersion,
      },
      migrationChanges40: {
        scenarios: [
          {
            title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
            id: '14Kap',
            removedExistingActions: 'Ddos protection. ',
            changedVulnerabilities: [
              {
                oldValue: 'Denial of service',
                newValue: 'Excessive use',
              },
            ],
            changedActions: [
              {
                title: 'Innlogging',
                id: 'w100Q',
                removedOwner: 'Kåre',
                removedDeadline: '2024-06-12',
              },
            ],
          },
        ],
      },
      migrationChanges41: {
        scenarios: [
          {
            title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
            id: '14Kap',
            changedRiskProbability: null,
            changedRiskConsequence: { oldValue: 1000, newValue: 8000 },
            changedRemainingRiskProbability: { oldValue: 0.1, newValue: 0.05 },
            changedRemainingRiskConsequence: {
              oldValue: 1000,
              newValue: 8000,
            },
          },
        ],
      },
      migrationChanges42: {
        scenarios: [
          {
            title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
            id: '14Kap',
            changedActions: [
              {
                title: 'Innlogging',
                id: 'w100Q',
                lastUpdated: '2025-07-09T11:28:14.801Z',
              },
            ],
          },
        ],
      },
      migrationChanges50: {
        scenarios: [
          {
            title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
            id: '14Kap',
            changedActionStatus: [
              { oldValue: 'Not started', newValue: 'Not OK' },
            ],
            changedActions: [
              {
                title: 'Innlogging',
                id: 'w100Q',
                changedActionStatus: {
                  oldValue: 'Not started',
                  newValue: 'Not OK',
                },
              },
            ],
          },
        ],
      },
      migrationChanges51: {
        scenarios: [
          {
            title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
            id: '14Kap',
            changedActions: [
              { title: 'Innlogging', id: 'w100Q', lastUpdatedBy: '' },
            ],
          },
        ],
      },
      migrationChanges52: { removedValuationsCount: 0 },
    });
  });

  it('migrates 5.2 to latest supported version by default', () => {
    const doc: RiScDocument = {
      schemaVersion: '5.2',
      title: 'Test',
      scope: 'Test',
      scenarios: [],
    };

    const [migrated, status] = migrate(doc);

    expect(migrated.schemaVersion).toBe(latestSupportedVersion);
    expect(status.migrationChanges).toBe(false);
    expect(status.migrationRequiresNewApproval).toBe(false);
    expect(status.migrationVersions).toEqual({
      fromVersion: '5.2',
      toVersion: latestSupportedVersion,
    });
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
    expect(status).toEqual({
      migrationChanges: false,
      migrationRequiresNewApproval: false,
      migrationVersions: { fromVersion: '5.2', toVersion: '5.2' },
    });
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
    const [_, status] = migrate(doc, lastPublished);

    const changes40 = status.migrationChanges40!;
    expect(changes40).toEqual({
      scenarios: [
        {
          title: 'Ondsinnet bruker ønsker å ta ned løsningen. ',
          id: '14Kap',
          removedExistingActions: 'Ddos protection. ',
          changedVulnerabilities: [
            {
              oldValue: 'Denial of service',
              newValue: 'Excessive use',
            },
          ],
          changedActions: [
            {
              title: 'Innlogging',
              id: 'w100Q',
              removedOwner: 'Kåre',
              removedDeadline: '2024-06-12',
            },
          ],
        },
      ],
    });
  });
});
