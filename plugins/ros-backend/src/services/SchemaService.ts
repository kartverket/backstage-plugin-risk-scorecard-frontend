/**
 * Schema validation and migration service.
 *
 * Ported from the Kotlin backend:
 *   - risc/validation/JSONValidator.kt
 *   - risc/utils/Migrations.kt
 *
 * Validates RiSc documents against JSON schemas (v3.2–v5.2),
 * detects versions, and migrates documents through the version chain.
 */

import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import * as yaml from 'yaml';
import {
  type MigrationStatus,
  type MigrationChange40,
  type MigrationChange40Scenario,
  type MigrationChange40Action,
  type MigrationChange41,
  type MigrationChange41Scenario,
  type MigrationChange42,
  type MigrationChange42Scenario,
  type MigrationChange42Action,
  type MigrationChange50,
  type MigrationChange50Scenario,
  type MigrationChange50Action,
  type MigrationChange51,
  type MigrationChange51Scenario,
  type MigrationChange51Action,
  type MigrationChange52,
  type MigrationChangedValue,
  type MigrationChangedTypedValue,
  type LastPublished,
  Vulnerability3X,
  Vulnerability,
  ActionStatus3X4X,
  ActionStatus,
} from '@internal/backstage-plugin-ros-common';
import {
  RiScVersion,
  ALL_RISC_VERSIONS,
  latestSupportedVersion,
} from '@internal/backstage-plugin-ros-common';

// ─── Schema Loading ────────────────────────────────────────────────────────────

import schemaV3_2 from '../schemas/risc_schema_en_v3_2.json';
import schemaV3_3 from '../schemas/risc_schema_en_v3_3.json';
import schemaV4_0 from '../schemas/risc_schema_en_v4_0.json';
import schemaV4_1 from '../schemas/risc_schema_en_v4_1.json';
import schemaV4_2 from '../schemas/risc_schema_en_v4_2.json';
import schemaV5_0 from '../schemas/risc_schema_en_v5_0.json';
import schemaV5_1 from '../schemas/risc_schema_en_v5_1.json';
import schemaV5_2 from '../schemas/risc_schema_en_v5_2.json';

const SCHEMAS: Record<string, object> = {
  '3.2': schemaV3_2,
  '3.3': schemaV3_3,
  '4.0': schemaV4_0,
  '4.1': schemaV4_1,
  '4.2': schemaV4_2,
  '5.0': schemaV5_0,
  '5.1': schemaV5_1,
  '5.2': schemaV5_2,
};

// ─── AJV Setup ─────────────────────────────────────────────────────────────────

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

// Pre-compile all schema validators (strip $id to avoid conflicts between versions)
const validators: Record<string, ReturnType<typeof ajv.compile>> = {};
for (const [version, schema] of Object.entries(SCHEMAS)) {
  const {
    $id: _id,
    $schema: _schema,
    ...rest
  } = schema as Record<string, unknown>;
  validators[version] = ajv.compile(rest);
}

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Raw JSON document — we operate on untyped objects for migration flexibility. */
export type RiScJson = Record<string, unknown>;

export interface ValidationResult {
  valid: boolean;
  version?: string;
  errors?: string[];
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Flatten the nested JSON schema format into the flat format used by our types.
 *
 * The JSON schema wraps scenarios and actions:
 *   `{ title, scenario: { ID, threatActors, actions: [{ title, action: { ID, ... } }] } }`
 *
 * The Kotlin backend uses `FlattenSerializer` to auto-flatten during deserialization.
 * This function does the equivalent transformation:
 *   `{ title, id, threatActors, actions: [{ title, id, ... }] }`
 */
export function normalizeRiScDocument(doc: RiScJson): RiScJson {
  const scenarios = doc.scenarios as
    | Array<Record<string, unknown>>
    | undefined;
  if (!scenarios) return doc;

  const normalizedScenarios = scenarios.map(scenarioWrapper => {
    const inner = scenarioWrapper.scenario as
      | Record<string, unknown>
      | undefined;
    if (!inner) {
      // Already flat (or malformed) — return as-is
      return scenarioWrapper;
    }

    const { ID, actions: rawActions, ...rest } = inner;
    const actions = rawActions as Array<Record<string, unknown>> | undefined;

    const normalizedActions = actions?.map(actionWrapper => {
      const actionInner = actionWrapper.action as
        | Record<string, unknown>
        | undefined;
      if (!actionInner) return actionWrapper;

      const { ID: actionID, ...actionRest } = actionInner;
      return {
        title: actionWrapper.title,
        id: actionID,
        ...actionRest,
      };
    });

    return {
      title: scenarioWrapper.title,
      id: ID,
      ...rest,
      actions: normalizedActions ?? [],
    };
  });

  return { ...doc, scenarios: normalizedScenarios };
}

/**
 * Parse content that may be JSON or YAML into a JavaScript object.
 */
export function parseContent(content: string): RiScJson {
  // Try JSON first
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed) as RiScJson;
    } catch {
      // Fall through to YAML
    }
  }
  // Try YAML
  const result = yaml.parse(content);
  if (typeof result !== 'object' || result === null) {
    throw new Error('Content is neither valid JSON nor valid YAML');
  }
  return result as RiScJson;
}

/**
 * Detect the schema version of a parsed RiSc document.
 */
export function detectVersion(doc: RiScJson): RiScVersion | null {
  const version = doc.schemaVersion;
  if (typeof version !== 'string') return null;
  const found = ALL_RISC_VERSIONS.find(v => v === version);
  return found ?? null;
}

/**
 * Validate content against a specific schema version, or detect the version and validate.
 * Returns validation result with details.
 */
export function validate(content: string, version?: string): ValidationResult {
  let doc: RiScJson;
  try {
    doc = parseContent(content);
  } catch {
    return { valid: false, errors: ['Content is neither valid JSON nor YAML'] };
  }

  if (version) {
    const validator = validators[version];
    if (!validator) {
      return { valid: false, errors: [`No schema for version ${version}`] };
    }
    const valid = validator(doc);
    return {
      valid: !!valid,
      version,
      errors: valid
        ? undefined
        : (validator.errors?.map(e => `${e.instancePath} ${e.message}`) ?? []),
    };
  }

  // Try all versions, return first valid
  for (const v of ALL_RISC_VERSIONS) {
    const validator = validators[v];
    if (validator && validator(doc)) {
      return { valid: true, version: v };
    }
  }

  return {
    valid: false,
    errors: ['Content does not validate against any known schema'],
  };
}

/**
 * Validate a parsed document against all schemas, returning true if any match.
 */
export function validateDoc(doc: RiScJson): ValidationResult {
  for (const v of ALL_RISC_VERSIONS) {
    const validator = validators[v];
    if (validator && validator(doc)) {
      return { valid: true, version: v };
    }
  }
  return {
    valid: false,
    errors: ['Content does not validate against any known schema'],
  };
}

/**
 * Migrate a RiSc document from its current version to a target version.
 *
 * @param doc The parsed RiSc document
 * @param lastPublished Optional last-published metadata (used in 4.1→4.2 migration)
 * @param toVersion Target version (defaults to latest)
 * @returns Tuple of [migrated document, migration status]
 */
export function migrate(
  doc: RiScJson,
  lastPublished?: LastPublished | null,
  toVersion: string = latestSupportedVersion,
): [RiScJson, MigrationStatus] {
  const fromVersion = detectVersion(doc);
  const targetVersion = ALL_RISC_VERSIONS.find(v => v === toVersion);

  if (!fromVersion || !targetVersion) {
    throw new Error(
      `Unsupported migration: Unable to migrate from ${doc.schemaVersion} to ${toVersion}`,
    );
  }

  const fromIndex = ALL_RISC_VERSIONS.indexOf(fromVersion);
  const toIndex = ALL_RISC_VERSIONS.indexOf(targetVersion);

  if (toIndex < fromIndex) {
    throw new Error(
      `Unsupported migration: Cannot migrate backwards from ${fromVersion} to ${toVersion}`,
    );
  }

  const status: MigrationStatus = {
    migrationChanges: false,
    migrationRequiresNewApproval: false,
    migrationVersions: {
      fromVersion,
      toVersion: targetVersion,
    },
  };

  return handleMigrate(doc, lastPublished ?? null, status, targetVersion);
}

// ─── Migration Engine ──────────────────────────────────────────────────────────

function handleMigrate(
  doc: RiScJson,
  lastPublished: LastPublished | null,
  status: MigrationStatus,
  toVersion: string,
): [RiScJson, MigrationStatus] {
  const currentVersion = doc.schemaVersion as string;
  if (currentVersion === toVersion) {
    return [doc, status];
  }

  let migrated: RiScJson;
  let newStatus: MigrationStatus;

  switch (currentVersion) {
    case RiScVersion.V3_2:
      [migrated, newStatus] = migrateFrom32To33(doc, status);
      break;
    case RiScVersion.V3_3:
      [migrated, newStatus] = migrateFrom33To40(doc, status);
      break;
    case RiScVersion.V4_0:
      [migrated, newStatus] = migrateFrom40To41(doc, status);
      break;
    case RiScVersion.V4_1:
      [migrated, newStatus] = migrateFrom41To42(doc, lastPublished, status);
      break;
    case RiScVersion.V4_2:
      [migrated, newStatus] = migrateFrom42To50(doc, status);
      break;
    case RiScVersion.V5_0:
      [migrated, newStatus] = migrateFrom50To51(doc, status);
      break;
    case RiScVersion.V5_1:
      [migrated, newStatus] = migrateFrom51To52(doc, status);
      break;
    default:
      throw new Error(
        `Unsupported migration: Unable to migrate from version ${currentVersion}`,
      );
  }

  return handleMigrate(migrated, lastPublished, newStatus, toVersion);
}

// ─── Migration Steps ───────────────────────────────────────────────────────────

/** 3.2 → 3.3: Only bump version (backwards compatible). */
export function migrateFrom32To33(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  return [{ ...doc, schemaVersion: RiScVersion.V3_3 }, status];
}

/** 3.3 → 4.0: Replace vulnerabilities, remove owner/deadline from actions, remove existingActions. */
export function migrateFrom33To40(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const scenarios = (doc.scenarios as Array<Record<string, unknown>>) || [];
  const changedScenarios: MigrationChange40Scenario[] = [];

  const migratedScenarios = scenarios.map(scenarioWrapper => {
    const scenario = scenarioWrapper.scenario as Record<string, unknown>;
    const title = scenarioWrapper.title as string;
    return {
      title,
      scenario: updateScenarioFrom33To40(title, scenario, changedScenarios),
    };
  });

  const changes40: MigrationChange40 | undefined =
    changedScenarios.length > 0 ? { scenarios: changedScenarios } : undefined;

  return [
    { ...doc, schemaVersion: RiScVersion.V4_0, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges40: changes40 ?? null,
    },
  ];
}

function updateScenarioFrom33To40(
  title: string,
  scenario: Record<string, unknown>,
  changedScenarios: MigrationChange40Scenario[],
): Record<string, unknown> {
  const vulnerabilityMap: Record<string, string> = {
    'User repudiation': 'Unmonitored use',
    'Compromised admin user': 'Unauthorized access',
    'Escalation of rights': 'Unauthorized access',
    'Disclosed secret': 'Information leak',
    'Denial of service': 'Excessive use',
    // Unchanged
    'Dependency vulnerability': 'Dependency vulnerability',
    'Information leak': 'Information leak',
    'Input tampering': 'Input tampering',
    Misconfiguration: 'Misconfiguration',
  };

  const oldVulnerabilities = (scenario.vulnerabilities as string[]) || [];
  const changedVulnerabilities: MigrationChangedTypedValue<
    Vulnerability3X,
    Vulnerability
  >[] = [];

  const newVulnerabilities = oldVulnerabilities.map(v => {
    const mapped = vulnerabilityMap[v] ?? v;
    if (mapped !== v) {
      changedVulnerabilities.push({
        oldValue: v as unknown as Vulnerability3X,
        newValue: mapped as unknown as Vulnerability,
      });
    }
    return mapped;
  });
  // Remove duplicates (as Kotlin does with .distinct())
  const distinctVulnerabilities = [...new Set(newVulnerabilities)];

  const actions = (scenario.actions as Array<Record<string, unknown>>) || [];
  const changedActions: MigrationChange40Action[] = [];

  const migratedActions = actions.map(actionWrapper => {
    const action = actionWrapper.action as Record<string, unknown>;
    const actionTitle = actionWrapper.title as string;
    const owner = action.owner as string | undefined;
    const deadline = action.deadline as string | undefined;

    if (owner || deadline) {
      changedActions.push({
        title: actionTitle,
        id: action.ID as string,
        removedOwner: owner || null,
        removedDeadline: deadline || null,
      });
    }

    // Remove owner and deadline
    const { owner: _o, deadline: _d, ...restAction } = action;
    return { title: actionTitle, action: restAction };
  });

  const existingActions = scenario.existingActions as string | undefined;
  const removedExistingActions =
    existingActions && existingActions.length > 0 ? existingActions : null;

  // Only add to changes if something changed
  if (
    removedExistingActions !== null ||
    (changedActions.length > 0 && changedVulnerabilities.length > 0)
  ) {
    changedScenarios.push({
      title,
      id: scenario.ID as string,
      removedExistingActions: removedExistingActions,
      changedVulnerabilities,
      changedActions,
    });
  }

  // Remove existingActions from scenario
  const { existingActions: _ea, ...restScenario } = scenario;
  return {
    ...restScenario,
    vulnerabilities: distinctVulnerabilities,
    actions: migratedActions,
  };
}

/** 4.0 → 4.1: Remap probability and consequence values to base-20 scale. */
export function migrateFrom40To41(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const scenarios = (doc.scenarios as Array<Record<string, unknown>>) || [];
  const changedScenarios: MigrationChange41Scenario[] = [];

  const migratedScenarios = scenarios.map(scenarioWrapper => {
    const scenario = scenarioWrapper.scenario as Record<string, unknown>;
    const title = scenarioWrapper.title as string;
    return {
      title,
      scenario: updateScenarioFrom40To41(title, scenario, changedScenarios),
    };
  });

  const changes41: MigrationChange41 | undefined =
    changedScenarios.length > 0 ? { scenarios: changedScenarios } : undefined;

  return [
    { ...doc, schemaVersion: RiScVersion.V4_1, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges41: changes41 ?? null,
    },
  ];
}

function updateScenarioFrom40To41(
  title: string,
  scenario: Record<string, unknown>,
  changedScenarios: MigrationChange41Scenario[],
): Record<string, unknown> {
  const consequenceMap: Record<number, number> = {
    1000: 8000,
    30000: 160000,
    1000000: 3200000,
    30000000: 64000000,
    1000000000: 1280000000,
  };

  const probabilityMap: Record<number, number> = {
    0.01: 0.0025,
    0.1: 0.05,
    1: 1,
    50: 20,
    300: 400,
  };

  const mapValue = (value: number, map: Record<number, number>): number =>
    map[value] ?? value;

  const risk = scenario.risk as Record<string, unknown>;
  const remainingRisk = scenario.remainingRisk as Record<string, unknown>;

  const oldRiskProb = risk.probability as number;
  const oldRiskCons = risk.consequence as number;
  const oldRemProb = remainingRisk.probability as number;
  const oldRemCons = remainingRisk.consequence as number;

  const newRiskProb = mapValue(oldRiskProb, probabilityMap);
  const newRiskCons = mapValue(oldRiskCons, consequenceMap);
  const newRemProb = mapValue(oldRemProb, probabilityMap);
  const newRemCons = mapValue(oldRemCons, consequenceMap);

  const migratedScenario = {
    ...scenario,
    risk: { ...risk, probability: newRiskProb, consequence: newRiskCons },
    remainingRisk: {
      ...remainingRisk,
      probability: newRemProb,
      consequence: newRemCons,
    },
  };

  function changeValue(
    oldVal: number,
    newVal: number,
  ): MigrationChangedValue<number> | null {
    return oldVal !== newVal ? { oldValue: oldVal, newValue: newVal } : null;
  }

  const changes: MigrationChange41Scenario = {
    title,
    id: scenario.ID as string,
    changedRiskProbability: changeValue(oldRiskProb, newRiskProb),
    changedRiskConsequence: changeValue(oldRiskCons, newRiskCons),
    changedRemainingRiskProbability: changeValue(oldRemProb, newRemProb),
    changedRemainingRiskConsequence: changeValue(oldRemCons, newRemCons),
  };

  const hasChanges =
    changes.changedRiskProbability !== null ||
    changes.changedRiskConsequence !== null ||
    changes.changedRemainingRiskProbability !== null ||
    changes.changedRemainingRiskConsequence !== null;

  if (hasChanges) {
    changedScenarios.push(changes);
  }

  return migratedScenario;
}

/** 4.1 → 4.2: Add lastUpdated field to actions. */
export function migrateFrom41To42(
  doc: RiScJson,
  lastPublished: LastPublished | null,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const scenarios = (doc.scenarios as Array<Record<string, unknown>>) || [];
  const changedScenarios: MigrationChange42Scenario[] = [];

  const migratedScenarios = scenarios.map(scenarioWrapper => {
    const scenario = scenarioWrapper.scenario as Record<string, unknown>;
    const title = scenarioWrapper.title as string;
    return {
      title,
      scenario: updateScenarioFrom41To42(
        title,
        scenario,
        lastPublished,
        changedScenarios,
      ),
    };
  });

  const changes42: MigrationChange42 | undefined =
    changedScenarios.length > 0 ? { scenarios: changedScenarios } : undefined;

  return [
    { ...doc, schemaVersion: RiScVersion.V4_2, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges42: changes42 ?? null,
    },
  ];
}

function updateScenarioFrom41To42(
  title: string,
  scenario: Record<string, unknown>,
  lastPublished: LastPublished | null,
  changedScenarios: MigrationChange42Scenario[],
): Record<string, unknown> {
  const actions = (scenario.actions as Array<Record<string, unknown>>) || [];
  const lastUpdatedValue = lastPublished?.dateTime ?? null;

  const migratedActions = actions.map(actionWrapper => {
    const action = actionWrapper.action as Record<string, unknown>;
    return {
      title: actionWrapper.title,
      action: { ...action, lastUpdated: lastUpdatedValue },
    };
  });

  const changedActions: MigrationChange42Action[] = migratedActions.map(
    actionWrapper => {
      const action = actionWrapper.action as Record<string, unknown>;
      return {
        title: actionWrapper.title as string,
        id: action.ID as string,
        lastUpdated: lastUpdatedValue,
      };
    },
  );

  if (changedActions.length > 0) {
    changedScenarios.push({
      title,
      id: scenario.ID as string,
      changedActions,
    });
  }

  return { ...scenario, actions: migratedActions };
}

/** 4.2 → 5.0: Change action status values. */
export function migrateFrom42To50(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const scenarios = (doc.scenarios as Array<Record<string, unknown>>) || [];
  const changedScenarios: MigrationChange50Scenario[] = [];

  const migratedScenarios = scenarios.map(scenarioWrapper => {
    const scenario = scenarioWrapper.scenario as Record<string, unknown>;
    const title = scenarioWrapper.title as string;
    return {
      title,
      scenario: updateScenarioFrom42To50(title, scenario, changedScenarios),
    };
  });

  const changes50: MigrationChange50 | undefined =
    changedScenarios.length > 0 ? { scenarios: changedScenarios } : undefined;

  return [
    { ...doc, schemaVersion: RiScVersion.V5_0, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges50: changes50 ?? null,
    },
  ];
}

function updateScenarioFrom42To50(
  title: string,
  scenario: Record<string, unknown>,
  changedScenarios: MigrationChange50Scenario[],
): Record<string, unknown> {
  const statusMap: Record<string, string> = {
    'Not started': 'Not OK',
    'In progress': 'Not OK',
    'On hold': 'Not OK',
    Completed: 'OK',
    Aborted: 'Not relevant',
  };

  const actions = (scenario.actions as Array<Record<string, unknown>>) || [];
  const changedActionStatuses: MigrationChangedTypedValue<
    ActionStatus3X4X,
    ActionStatus
  >[] = [];
  const changedActions: MigrationChange50Action[] = [];

  const migratedActions = actions.map(actionWrapper => {
    const action = actionWrapper.action as Record<string, unknown>;
    const oldStatus = action.status as string;
    const newStatus = statusMap[oldStatus] ?? oldStatus;

    if (newStatus !== oldStatus) {
      changedActionStatuses.push({
        oldValue: oldStatus as unknown as ActionStatus3X4X,
        newValue: newStatus as unknown as ActionStatus,
      });
      changedActions.push({
        title: actionWrapper.title as string,
        id: action.ID as string,
        changedActionStatus: {
          oldValue: oldStatus as unknown as ActionStatus3X4X,
          newValue: newStatus as unknown as ActionStatus,
        },
      });
    }

    return {
      title: actionWrapper.title,
      action: { ...action, status: newStatus },
    };
  });

  if (changedActionStatuses.length > 0) {
    changedScenarios.push({
      title,
      id: scenario.ID as string,
      changedActionStatus: changedActionStatuses,
      changedActions,
    });
  }

  return { ...scenario, actions: migratedActions };
}

/** 5.0 → 5.1: Add lastUpdatedBy field to actions. */
export function migrateFrom50To51(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const scenarios = (doc.scenarios as Array<Record<string, unknown>>) || [];
  const changedScenarios: MigrationChange51Scenario[] = [];

  const migratedScenarios = scenarios.map(scenarioWrapper => {
    const scenario = scenarioWrapper.scenario as Record<string, unknown>;
    const title = scenarioWrapper.title as string;
    return {
      title,
      scenario: updateScenarioFrom50To51(title, scenario, changedScenarios),
    };
  });

  const changes51: MigrationChange51 | undefined =
    changedScenarios.length > 0 ? { scenarios: changedScenarios } : undefined;

  return [
    { ...doc, schemaVersion: RiScVersion.V5_1, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges51: changes51 ?? null,
    },
  ];
}

function updateScenarioFrom50To51(
  title: string,
  scenario: Record<string, unknown>,
  changedScenarios: MigrationChange51Scenario[],
): Record<string, unknown> {
  const actions = (scenario.actions as Array<Record<string, unknown>>) || [];

  const migratedActions = actions.map(actionWrapper => {
    const action = actionWrapper.action as Record<string, unknown>;
    return {
      title: actionWrapper.title,
      action: { ...action, lastUpdatedBy: '' },
    };
  });

  const changedActions: MigrationChange51Action[] = migratedActions.map(
    actionWrapper => {
      const action = actionWrapper.action as Record<string, unknown>;
      return {
        title: actionWrapper.title as string,
        id: action.ID as string,
        lastUpdatedBy: action.lastUpdatedBy as string,
      };
    },
  );

  if (changedActions.length > 0) {
    changedScenarios.push({
      title,
      id: scenario.ID as string,
      changedActions,
    });
  }

  return { ...scenario, actions: migratedActions };
}

/** 5.1 → 5.2: Remove valuations. */
export function migrateFrom51To52(
  doc: RiScJson,
  status: MigrationStatus,
): [RiScJson, MigrationStatus] {
  const valuations = doc.valuations as unknown[] | undefined;
  const removedValuationsCount = valuations?.length ?? 0;

  const { valuations: _v, ...rest } = doc;
  const migrated = { ...rest, schemaVersion: RiScVersion.V5_2 };

  const changes52: MigrationChange52 = { removedValuationsCount };

  return [
    migrated,
    {
      ...status,
      migrationChanges: status.migrationChanges || removedValuationsCount > 0,
      migrationRequiresNewApproval: true,
      migrationChanges52: changes52,
    },
  ];
}
