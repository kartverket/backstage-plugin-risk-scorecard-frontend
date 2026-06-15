/**
 * Schema validation and migration service.
 *
 * Ported from the Kotlin backend:
 *   - risc/validation/JSONValidator.kt
 *   - risc/utils/Migrations.kt
 *
 * Validates RiSc documents against JSON schemas (v3.2–v5.4),
 * detects versions, and migrates documents through the version chain.
 */

import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import * as yaml from 'yaml';
import {
  type MigrationStatus,
  type MigrationChange40Scenario,
  type MigrationChange40Action,
  type MigrationChange41Scenario,
  type MigrationChange42Scenario,
  type MigrationChange42Action,
  type MigrationChange50Scenario,
  type MigrationChange50Action,
  type MigrationChange51Scenario,
  type MigrationChange51Action,
  type MigrationChange52,
  type MigrationChangedValue,
  type MigrationChangedTypedValue,
  type LastPublished,
  type Vulnerability3X,
  Vulnerability,
  type ActionStatus3X4X,
  ActionStatus,
  type RiScDocument,
  type RiSc3X,
  type RiSc4X,
  type RiSc5X,
  type RiSc3XScenario,
  type RiSc4XScenario,
  type RiSc5XScenario,
  RiScVersion,
  latestSupportedVersion,
  riscSchemasByVersion,
  supportedRiScVersions,
} from '@kartverket/ros-common';

// ─── AJV Setup ─────────────────────────────────────────────────────────────────

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

function compileSchemaForVersion(
  version: RiScVersion,
): ReturnType<typeof ajv.compile> {
  // Pre-compile all schema validators (strip $id to avoid conflicts between versions)
  const { $id: _id, $schema: _schema, ...rest } = riscSchemasByVersion[version];
  return ajv.compile(rest);
}

const validators: Record<RiScVersion, ReturnType<typeof ajv.compile>> = {
  [RiScVersion.V3_2]: compileSchemaForVersion(RiScVersion.V3_2),
  [RiScVersion.V3_3]: compileSchemaForVersion(RiScVersion.V3_3),
  [RiScVersion.V4_0]: compileSchemaForVersion(RiScVersion.V4_0),
  [RiScVersion.V4_1]: compileSchemaForVersion(RiScVersion.V4_1),
  [RiScVersion.V4_2]: compileSchemaForVersion(RiScVersion.V4_2),
  [RiScVersion.V5_0]: compileSchemaForVersion(RiScVersion.V5_0),
  [RiScVersion.V5_1]: compileSchemaForVersion(RiScVersion.V5_1),
  [RiScVersion.V5_2]: compileSchemaForVersion(RiScVersion.V5_2),
  [RiScVersion.V5_3]: compileSchemaForVersion(RiScVersion.V5_3),
  [RiScVersion.V5_4]: compileSchemaForVersion(RiScVersion.V5_4),
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type UnvalidatedRiScJson = Record<string, unknown>;

export interface ValidationResult {
  valid: boolean;
  version?: string;
  errors?: string[];
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Parse content that may be JSON or YAML into a JavaScript object.
 */
function parseRawContent(content: string): UnvalidatedRiScJson {
  // Try JSON first
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (isRiScJson(parsed)) {
        return parsed;
      }
    } catch {
      // Fall through to YAML
    }
  }

  // Try YAML
  const result = yaml.parse(content);
  if (isRiScJson(result)) {
    return result;
  }
  throw new Error('Content is neither valid JSON nor valid YAML');
}

/**
 * Parse content that may be JSON or YAML into a verified RiSc document.
 */
export function parseContent(content: string): RiScDocument {
  const doc = parseRawContent(content);
  assertValidRiScDocument(doc);
  return doc;
}

/**
 * Detect the schema version of a parsed RiSc document.
 */
export function getVersion(version: unknown): RiScVersion {
  const found = findVersion(version);
  if (!found) {
    throw new Error(`Version '${String(version)}' is not known`);
  }
  return found;
}

/**
 * Validate content against a specific schema version, or detect the version and validate.
 * Returns validation result with details.
 */
export function validate(content: string, version?: string): ValidationResult {
  let doc: UnvalidatedRiScJson;
  try {
    doc = parseRawContent(content);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Invalid content'],
    };
  }

  return validateParsedDoc(doc, version);
}

function validateParsedDoc(
  doc: UnvalidatedRiScJson,
  version?: string,
): ValidationResult {
  const documentVersion =
    typeof doc.schemaVersion === 'string' ? doc.schemaVersion : null;
  const requestedVersion = version ?? documentVersion;

  if (!requestedVersion) {
    return { valid: false, errors: ['Missing schema version'] };
  }

  const schemaVersion = findVersion(requestedVersion);
  if (!schemaVersion) {
    return {
      valid: false,
      errors: [`No schema for version ${requestedVersion}`],
    };
  }

  if (documentVersion !== schemaVersion) {
    return {
      valid: false,
      version: schemaVersion,
      errors: [
        `Document schemaVersion ${String(documentVersion)} does not match schema ${schemaVersion}`,
      ],
    };
  }

  const validator = validators[schemaVersion];
  if (!validator) {
    return { valid: false, errors: [`No schema for version ${schemaVersion}`] };
  }

  const valid = validator(doc);
  if (typeof valid !== 'boolean') {
    throw new Error('Async schema validation is not supported');
  }

  return {
    valid,
    version: schemaVersion,
    errors: valid
      ? undefined
      : (validator.errors?.map(e => `${e.instancePath} ${e.message}`) ?? []),
  };
}

function assertValidRiScDocument(
  doc: unknown,
  expectedVersion?: RiScVersion,
): asserts doc is RiScDocument {
  if (!isRiScJson(doc)) {
    throw new Error(
      'RiSc schema validation failed: Document is not a JSON object',
    );
  }

  const version = findVersion(doc.schemaVersion);
  if (!version) {
    throw new Error(`Version '${String(doc.schemaVersion)}' is not known`);
  }

  if (expectedVersion && version !== expectedVersion) {
    throw new Error(
      `RiSc schema validation failed: Document schemaVersion ${String(doc.schemaVersion)} does not match schema ${expectedVersion}`,
    );
  }

  const result = validateParsedDoc(doc, expectedVersion ?? version);
  if (!result.valid) {
    throw new Error(
      `RiSc schema validation failed: ${result.errors?.join(', ') ?? 'Unknown error'}`,
    );
  }
}

function findVersion(version: unknown): RiScVersion | null {
  return supportedRiScVersions.find(v => v === version) ?? null;
}

function isRiScJson(doc: unknown): doc is UnvalidatedRiScJson {
  return typeof doc === 'object' && doc !== null && !Array.isArray(doc);
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
  doc: RiScDocument,
  lastPublished?: LastPublished | null,
  toVersion: string = latestSupportedVersion,
): [RiScDocument, MigrationStatus] {
  const fromVersion = doc.schemaVersion;
  const targetVersion = getVersion(toVersion);

  const fromIndex = supportedRiScVersions.indexOf(fromVersion);
  const toIndex = supportedRiScVersions.indexOf(targetVersion);

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

  const [migrated, migratedStatus] = handleMigrate(
    doc,
    lastPublished ?? null,
    status,
    targetVersion,
  );

  assertValidRiScDocument(migrated, targetVersion);
  return [migrated, migratedStatus];
}

// ─── Migration Engine ──────────────────────────────────────────────────────────
function executeMigration(
  doc: RiScDocument,
  lastPublished: LastPublished | null,
  status: MigrationStatus,
): [RiScDocument, MigrationStatus] {
  const version = doc.schemaVersion;
  switch (version) {
    case RiScVersion.V5_4:
      throw new Error(
        'Migration from V5_4 not added yet. As long as it is newest version the code should not reach here',
      );
    case RiScVersion.V5_3:
      return migrateFrom53To54(doc, status);
    case RiScVersion.V5_2:
      return migrateFrom52To53(doc, status);
    case RiScVersion.V5_1:
      return migrateFrom51To52(doc, status);
    case RiScVersion.V5_0:
      return migrateFrom50To51(doc, status);
    case RiScVersion.V4_2:
      return migrateFrom42To50(doc, status);
    case RiScVersion.V4_1:
      return migrateFrom41To42(doc, lastPublished, status);
    case RiScVersion.V4_0:
      return migrateFrom40To41(doc, status);
    case RiScVersion.V3_3:
      return migrateFrom33To40(doc, status);
    case RiScVersion.V3_2:
      return migrateFrom32To33(doc, status);
    default: {
      // noinspection UnnecessaryLocalVariableJS Trigger compiler error on missing case while still satisfying linting rules
      const unhandledVersion: never = version;
      throw new Error(`Unhandled RiSc version: ${String(unhandledVersion)}`);
    }
  }
}

function handleMigrate(
  doc: RiScDocument,
  lastPublished: LastPublished | null,
  status: MigrationStatus,
  toVersion: RiScVersion,
): [RiScDocument, MigrationStatus] {
  if (doc.schemaVersion === toVersion) {
    return [doc, status];
  }

  const [migrated, newStatus] = executeMigration(doc, lastPublished, status);
  return handleMigrate(migrated, lastPublished, newStatus, toVersion);
}

// ─── Mapping Constants ─────────────────────────────────────────────────────────

const VULNERABILITY_3X_TO_4X_MAP: Record<Vulnerability3X, Vulnerability> = {
  'User repudiation': 'Unmonitored use',
  'Compromised admin user': 'Unauthorized access',
  'Escalation of rights': 'Unauthorized access',
  'Disclosed secret': 'Information leak',
  'Denial of service': 'Excessive use',
  'Dependency vulnerability': 'Dependency vulnerability',
  'Information leak': 'Information leak',
  'Input tampering': 'Input tampering',
  Misconfiguration: 'Misconfiguration',
};

const CONSEQUENCE_40_TO_41_MAP: Record<number, number> = {
  1000: 8000,
  30000: 160000,
  1000000: 3200000,
  30000000: 64000000,
  1000000000: 1280000000,
};

const PROBABILITY_40_TO_41_MAP: Record<number, number> = {
  0.01: 0.0025,
  0.1: 0.05,
  1: 1,
  50: 20,
  300: 400,
};

const ACTION_STATUS_4X_TO_5X_MAP: Record<ActionStatus3X4X, ActionStatus> = {
  'Not started': 'Not OK',
  'In progress': 'Not OK',
  'On hold': 'Not OK',
  Completed: 'OK',
  Aborted: 'Not relevant',
};

// ─── Migration Helpers ─────────────────────────────────────────────────────────

function migrateScenarios<
  RISC_FROM_TYPE extends RiScDocument,
  SCENARIO_TO_TYPE,
  CHANGE_TYPE,
>(
  doc: RISC_FROM_TYPE,
  updateFn: (
    scenario: RISC_FROM_TYPE['scenarios'][number],
    changes: CHANGE_TYPE[],
  ) => SCENARIO_TO_TYPE,
): {
  migratedScenarios: SCENARIO_TO_TYPE[];
  changedScenarios: CHANGE_TYPE[];
} {
  const scenarios = doc.scenarios ?? [];
  const changedScenarios: CHANGE_TYPE[] = [];

  const migratedScenarios = scenarios.map(scenario => {
    return updateFn(scenario, changedScenarios);
  });

  return { migratedScenarios, changedScenarios };
}

// ─── Migration Steps ───────────────────────────────────────────────────────────

/** 3.2 → 3.3: Only bump version (backwards compatible). */
export function migrateFrom32To33(
  doc: RiSc3X,
  status: MigrationStatus,
): [RiSc3X, MigrationStatus] {
  return [{ ...doc, schemaVersion: RiScVersion.V3_3 }, status];
}

/** 3.3 → 4.0: Replace vulnerabilities, remove owner/deadline from actions, remove existingActions. */
export function migrateFrom33To40(
  doc: RiSc3X,
  status: MigrationStatus,
): [RiSc4X, MigrationStatus] {
  const { migratedScenarios, changedScenarios } = migrateScenarios<
    RiSc3X,
    RiSc4XScenario,
    MigrationChange40Scenario
  >(doc, updateScenarioFrom33To40);

  return [
    { ...doc, schemaVersion: RiScVersion.V4_0, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges40:
        changedScenarios.length > 0 ? { scenarios: changedScenarios } : null,
    },
  ];
}

function updateScenarioFrom33To40(
  { title, scenario }: RiSc3XScenario,
  changedScenarios: MigrationChange40Scenario[],
): RiSc4XScenario {
  const oldVulnerabilities = scenario.vulnerabilities;
  const changedVulnerabilities: MigrationChangedTypedValue<
    Vulnerability3X,
    Vulnerability
  >[] = [];

  const newVulnerabilities: Vulnerability[] = oldVulnerabilities.map(v => {
    const mapped = VULNERABILITY_3X_TO_4X_MAP[v];
    if (mapped.valueOf() !== v.valueOf()) {
      changedVulnerabilities.push({
        oldValue: v,
        newValue: mapped,
      });
    }
    return mapped;
  });

  const distinctVulnerabilities = [...new Set(newVulnerabilities)];

  const actions = scenario.actions;
  const changedActions: MigrationChange40Action[] = [];

  const migratedActions = actions.map(actionWrapper => {
    const action = actionWrapper.action;
    const actionTitle = actionWrapper.title;
    const owner = action.owner;
    const deadline = action.deadline;

    if (owner || deadline) {
      changedActions.push({
        title: actionTitle,
        id: action.ID,
        removedOwner: owner || null,
        removedDeadline: deadline || null,
      });
    }

    // Remove owner and deadline
    const { owner: _o, deadline: _d, ...restAction } = action;
    return { title: actionTitle, action: restAction };
  });

  const existingActions = scenario.existingActions;
  const removedExistingActions =
    existingActions && existingActions.length > 0 ? existingActions : null;

  // Only add to changes if something changed
  if (
    removedExistingActions !== null ||
    changedActions.length > 0 ||
    changedVulnerabilities.length > 0
  ) {
    changedScenarios.push({
      title,
      id: scenario.ID,
      removedExistingActions: removedExistingActions,
      changedVulnerabilities,
      changedActions,
    });
  }

  // Remove existingActions from scenario
  const { existingActions: _ea, ...restScenario } = scenario;
  return {
    title: title,
    scenario: {
      ...restScenario,
      vulnerabilities: distinctVulnerabilities,
      actions: migratedActions,
    },
  };
}

/** 4.0 → 4.1: Remap probability and consequence values to base-20 scale. */
export function migrateFrom40To41(
  doc: RiSc4X,
  status: MigrationStatus,
): [RiSc4X, MigrationStatus] {
  const { migratedScenarios, changedScenarios } = migrateScenarios<
    RiSc4X,
    RiSc4XScenario,
    MigrationChange41Scenario
  >(doc, updateScenarioFrom40To41);

  return [
    { ...doc, schemaVersion: RiScVersion.V4_1, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges41:
        changedScenarios.length > 0 ? { scenarios: changedScenarios } : null,
    },
  ];
}

function updateScenarioFrom40To41(
  { title, scenario }: RiSc4XScenario,
  changedScenarios: MigrationChange41Scenario[],
): RiSc4XScenario {
  const mapValue = (value: number, map: Record<number, number>): number => {
    if (!map[value]) {
      throw new Error(
        `No mapping exists for ${value} in ${JSON.stringify(map)}`,
      );
    }
    return map[value];
  };

  const risk = scenario.risk;
  const remainingRisk = scenario.remainingRisk;

  const oldRiskProb = risk.probability;
  const oldRiskCons = risk.consequence;
  const oldRemProb = remainingRisk.probability;
  const oldRemCons = remainingRisk.consequence;

  const newRiskProb = mapValue(oldRiskProb, PROBABILITY_40_TO_41_MAP);
  const newRiskCons = mapValue(oldRiskCons, CONSEQUENCE_40_TO_41_MAP);
  const newRemProb = mapValue(oldRemProb, PROBABILITY_40_TO_41_MAP);
  const newRemCons = mapValue(oldRemCons, CONSEQUENCE_40_TO_41_MAP);

  const migratedScenario: RiSc4XScenario = {
    title,
    scenario: {
      ...scenario,
      risk: { ...risk, probability: newRiskProb, consequence: newRiskCons },
      remainingRisk: {
        ...remainingRisk,
        probability: newRemProb,
        consequence: newRemCons,
      },
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
    id: scenario.ID,
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
  doc: RiSc4X,
  lastPublished: LastPublished | null,
  status: MigrationStatus,
): [RiSc4X, MigrationStatus] {
  const { migratedScenarios, changedScenarios } = migrateScenarios<
    RiSc4X,
    RiSc4XScenario,
    MigrationChange42Scenario
  >(doc, (scenario, changes) =>
    updateScenarioFrom41To42(scenario, lastPublished, changes),
  );

  return [
    { ...doc, schemaVersion: RiScVersion.V4_2, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges42:
        changedScenarios.length > 0 ? { scenarios: changedScenarios } : null,
    },
  ];
}

function updateScenarioFrom41To42(
  { scenario, title }: RiSc4XScenario,
  lastPublished: LastPublished | null,
  changedScenarios: MigrationChange42Scenario[],
): RiSc4XScenario {
  const lastUpdatedField =
    lastPublished !== null ? { lastUpdated: lastPublished?.dateTime } : {};

  const migratedActions = scenario.actions.map(actionWrapper => {
    const action = actionWrapper.action;
    return {
      title: actionWrapper.title,
      action: { ...action, ...lastUpdatedField },
    };
  });

  const changedActions: MigrationChange42Action[] = migratedActions.map(
    ({ title: actionTitle, action }) => {
      return {
        title: actionTitle,
        id: action.ID,
        ...lastUpdatedField,
      };
    },
  );

  if (changedActions.length > 0) {
    changedScenarios.push({
      title,
      id: scenario.ID,
      changedActions,
    });
  }

  return { title, scenario: { ...scenario, actions: migratedActions } };
}

/** 4.2 → 5.0: Change action status values. */
export function migrateFrom42To50(
  doc: RiSc4X,
  status: MigrationStatus,
): [RiSc5X, MigrationStatus] {
  const { migratedScenarios, changedScenarios } = migrateScenarios<
    RiSc4X,
    RiSc5XScenario,
    MigrationChange50Scenario
  >(doc, updateScenarioFrom42To50);

  return [
    { ...doc, schemaVersion: RiScVersion.V5_0, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges50:
        changedScenarios.length > 0 ? { scenarios: changedScenarios } : null,
    },
  ];
}

function updateScenarioFrom42To50(
  { title, scenario }: RiSc4XScenario,
  changedScenarios: MigrationChange50Scenario[],
): RiSc5XScenario {
  const changedActionStatuses: MigrationChangedTypedValue<
    ActionStatus3X4X,
    ActionStatus
  >[] = [];
  const changedActions: MigrationChange50Action[] = [];

  const migratedActions = scenario.actions.map(actionWrapper => {
    const action = actionWrapper.action;
    const oldStatus = action.status;
    const newStatus = ACTION_STATUS_4X_TO_5X_MAP[oldStatus];

    if (newStatus.valueOf() !== oldStatus.valueOf()) {
      changedActionStatuses.push({
        oldValue: oldStatus,
        newValue: newStatus,
      });
      changedActions.push({
        title: actionWrapper.title,
        id: action.ID,
        changedActionStatus: {
          oldValue: oldStatus,
          newValue: newStatus,
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
      id: scenario.ID,
      changedActionStatus: changedActionStatuses,
      changedActions,
    });
  }

  return { title, scenario: { ...scenario, actions: migratedActions } };
}

/** 5.0 → 5.1: Add lastUpdatedBy field to actions. */
export function migrateFrom50To51(
  doc: RiSc5X,
  status: MigrationStatus,
): [RiSc5X, MigrationStatus] {
  const { migratedScenarios, changedScenarios } = migrateScenarios<
    RiSc5X,
    RiSc5XScenario,
    MigrationChange51Scenario
  >(doc, updateScenarioFrom50To51);

  return [
    { ...doc, schemaVersion: RiScVersion.V5_1, scenarios: migratedScenarios },
    {
      ...status,
      migrationChanges: true,
      migrationRequiresNewApproval: true,
      migrationChanges51:
        changedScenarios.length > 0 ? { scenarios: changedScenarios } : null,
    },
  ];
}

function updateScenarioFrom50To51(
  { title, scenario }: RiSc5XScenario,
  changedScenarios: MigrationChange51Scenario[],
): RiSc5XScenario {
  const migratedActions = scenario.actions.map(actionWrapper => {
    return {
      title: actionWrapper.title,
      action: { ...actionWrapper.action, lastUpdatedBy: '' },
    };
  });

  const changedActions: MigrationChange51Action[] = migratedActions.map(
    actionWrapper => {
      const action = actionWrapper.action;
      return {
        title: actionWrapper.title,
        id: action.ID,
        lastUpdatedBy: action.lastUpdatedBy,
      };
    },
  );

  if (changedActions.length > 0) {
    changedScenarios.push({
      title,
      id: scenario.ID,
      changedActions,
    });
  }

  return { title, scenario: { ...scenario, actions: migratedActions } };
}

/** 5.1 → 5.2: Remove valuations. */
export function migrateFrom51To52(
  doc: RiSc5X,
  status: MigrationStatus,
): [RiSc5X, MigrationStatus] {
  const valuations = doc.valuations;
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

/** 5.2 → 5.3: Add optional unencryptedMetadata.appliesTo. */
export function migrateFrom52To53(
  doc: RiSc5X,
  status: MigrationStatus,
): [RiSc5X, MigrationStatus] {
  return [{ ...doc, schemaVersion: RiScVersion.V5_3 }, status];
}

/** 5.3 → 5.4: Add optional action comment field. */
export function migrateFrom53To54(
  doc: RiSc5X,
  status: MigrationStatus,
): [RiSc5X, MigrationStatus] {
  return [{ ...doc, schemaVersion: RiScVersion.V5_4 }, status];
}
