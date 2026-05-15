/**
 * Comparison service for computing diffs between RiSc versions.
 *
 * Ported from the Kotlin backend:
 *   - utils/comparison/Comparison.kt (653 lines)
 *   - utils/comparison/ComparisonDTOs.kt (230 lines)
 *
 * Compares two RiSc JSON objects field-by-field and produces structured
 * change objects with property-level tracking (Added, Deleted, Changed,
 * ContentChanged, Unchanged). Scenarios are matched by ID, not position.
 */

import {
  type RiSc5X,
  type RiSc5XScenario,
  type RiSc5XAction,
  type RiSc4X,
  type RiSc4XScenario,
  type RiSc4XAction,
  type RiSc3X,
  type RiSc3XScenario,
  type RiSc3XAction,
  type RiScRisk,
  type RiScValuation,
  type RiScDocument,
  type MigrationStatus,
  type LastPublished,
  type SimpleTrackedProperty,
  type TrackedProperty,
  type AddedProperty,
  type DeletedProperty,
  type ChangedProperty,
  type ContentChangedProperty,
  type UnchangedProperty,
  type RiScChange,
  type RiSc5XChange,
  type RiSc5XScenarioChange,
  type RiSc5XActionChange,
  type RiSc4XChange,
  type RiSc4XScenarioChange,
  type RiSc4XActionChange,
  type RiSc3XChange,
  type RiSc3XScenarioChange,
  type RiSc3XActionChange,
  type RiScRiskChange,
  type ThreatActor,
  type Vulnerability,
  type Vulnerability3X,
  type ActionStatus,
  type ActionStatus3X4X,
} from '@internal/backstage-plugin-ros-common';

import { type RiScJson, migrate } from './SchemaService';

// ─── Error ─────────────────────────────────────────────────────────────────────

export class ComparisonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComparisonError';
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Compare a mandatory simple property. Always returns a tracked property
 * (ChangedProperty if different, UnchangedProperty if the same).
 */
export function changeForMandatorySimpleProperty<T>(
  oldValue: T,
  newValue: T,
): SimpleTrackedProperty<T> {
  if (!deepEqual(oldValue, newValue)) {
    return { type: 'CHANGED', oldValue, newValue } as ChangedProperty<T>;
  }
  return { type: 'UNCHANGED', value: newValue } as UnchangedProperty<T>;
}

/**
 * Compare a non-mandatory simple property. Returns null if unchanged,
 * ChangedProperty if different.
 */
export function changeForNonMandatorySimpleProperty<T>(
  oldValue: T,
  newValue: T,
): SimpleTrackedProperty<T> | null {
  if (!deepEqual(oldValue, newValue)) {
    return { type: 'CHANGED', oldValue, newValue } as ChangedProperty<T>;
  }
  return null;
}

/**
 * Compare a list of simple (non-ID-bearing) values. Returns only Added and
 * Deleted entries.
 */
export function changeForListOfSimpleProperty<T>(
  oldValues: T[],
  newValues: T[],
): SimpleTrackedProperty<T>[] {
  const deleted: SimpleTrackedProperty<T>[] = oldValues
    .filter(v => !newValues.some(nv => deepEqual(v, nv)))
    .map(v => ({ type: 'DELETED', oldValue: v }) as DeletedProperty<T>);

  const added: SimpleTrackedProperty<T>[] = newValues
    .filter(v => !oldValues.some(ov => deepEqual(v, ov)))
    .map(v => ({ type: 'ADDED', newValue: v }) as AddedProperty<T>);

  return [...deleted, ...added];
}

/**
 * Compare a list of complex (ID-bearing) values. Matches items by key,
 * detects additions, deletions, and content changes.
 */
export function changeForListOfComplexProperty<S, T, U>(
  oldValues: T[],
  newValues: T[],
  keySelector: (item: T) => U,
  changeMapper: (oldItem: T, newItem: T) => S,
): TrackedProperty<S, T>[] {
  const oldKeys = new Set(oldValues.map(keySelector));
  const newKeys = new Set(newValues.map(keySelector));

  const deleted: TrackedProperty<S, T>[] = oldValues
    .filter(item => !newKeys.has(keySelector(item)))
    .map(item => ({ type: 'DELETED', oldValue: item }) as DeletedProperty<T>);

  const added: TrackedProperty<S, T>[] = newValues
    .filter(item => !oldKeys.has(keySelector(item)))
    .map(item => ({ type: 'ADDED', newValue: item }) as AddedProperty<T>);

  const changed: TrackedProperty<S, T>[] = oldValues
    .filter(item => newKeys.has(keySelector(item)))
    .map(oldItem => {
      const newItem = newValues.find(
        item => keySelector(item) === keySelector(oldItem),
      )!;
      return { oldItem, newItem };
    })
    .filter(({ oldItem, newItem }) => !deepEqual(oldItem, newItem))
    .map(
      ({ oldItem, newItem }) =>
        ({
          type: 'CONTENT_CHANGED',
          value: changeMapper(oldItem, newItem),
        }) as ContentChangedProperty<S>,
    );

  return [...deleted, ...changed, ...added];
}

// ─── Risk Comparison ───────────────────────────────────────────────────────────

function compareRisk(
  oldRisk: RiScRisk,
  newRisk: RiScRisk,
): SimpleTrackedProperty<RiScRiskChange> {
  return {
    type: 'CONTENT_CHANGED',
    value: {
      summary: changeForNonMandatorySimpleProperty(
        oldRisk.summary ?? null,
        newRisk.summary ?? null,
      ),
      probability: changeForMandatorySimpleProperty(
        oldRisk.probability,
        newRisk.probability,
      ),
      consequence: changeForMandatorySimpleProperty(
        oldRisk.consequence,
        newRisk.consequence,
      ),
    },
  } as ContentChangedProperty<RiScRiskChange>;
}

// ─── Valuations ────────────────────────────────────────────────────────────────

function compareValuations(
  oldValuations: RiScValuation[],
  newValuations: RiScValuation[],
): SimpleTrackedProperty<RiScValuation>[] {
  return changeForListOfSimpleProperty(oldValuations, newValuations);
}

// ─── Common Field Helpers ───────────────────────────────────────────────────────

function compareCommonActionFields(
  oldAction: { title: string; id: string; description: string; url?: string | null },
  newAction: { title: string; id: string; description: string; url?: string | null },
) {
  return {
    title: changeForMandatorySimpleProperty(oldAction.title, newAction.title),
    id: newAction.id,
    description: changeForMandatorySimpleProperty(
      oldAction.description,
      newAction.description,
    ),
    url: changeForNonMandatorySimpleProperty(
      oldAction.url ?? null,
      newAction.url ?? null,
    ),
  };
}

function compareCommonScenarioFields(
  oldScenario: {
    title: string;
    id: string;
    description: string;
    url?: string | null;
    threatActors: ThreatActor[];
    risk: RiScRisk;
    remainingRisk: RiScRisk;
  },
  newScenario: {
    title: string;
    id: string;
    description: string;
    url?: string | null;
    threatActors: ThreatActor[];
    risk: RiScRisk;
    remainingRisk: RiScRisk;
  },
) {
  return {
    title: changeForMandatorySimpleProperty(
      oldScenario.title,
      newScenario.title,
    ),
    id: newScenario.id,
    description: changeForMandatorySimpleProperty(
      oldScenario.description,
      newScenario.description,
    ),
    url: changeForNonMandatorySimpleProperty(
      oldScenario.url ?? null,
      newScenario.url ?? null,
    ),
    threatActors: changeForListOfSimpleProperty(
      oldScenario.threatActors,
      newScenario.threatActors,
    ) as SimpleTrackedProperty<ThreatActor>[],
    risk: compareRisk(oldScenario.risk, newScenario.risk),
    remainingRisk: compareRisk(
      oldScenario.remainingRisk,
      newScenario.remainingRisk,
    ),
  };
}

function compareCommonRiScFields(
  oldRiSc: { title: string; scope: string; valuations?: RiScValuation[] | null },
  newRiSc: { title: string; scope: string; valuations?: RiScValuation[] | null },
  migrationStatus: MigrationStatus,
) {
  return {
    title: changeForNonMandatorySimpleProperty(oldRiSc.title, newRiSc.title),
    scope: changeForNonMandatorySimpleProperty(oldRiSc.scope, newRiSc.scope),
    valuations: compareValuations(
      oldRiSc.valuations ?? [],
      newRiSc.valuations ?? [],
    ),
    migrationChanges: migrationStatus,
  };
}

// ─── v5.x Comparison ───────────────────────────────────────────────────────────

function compareActions5X(
  oldActions: RiSc5XAction[],
  newActions: RiSc5XAction[],
): TrackedProperty<RiSc5XActionChange, RiSc5XAction>[] {
  return changeForListOfComplexProperty(
    oldActions,
    newActions,
    action => action.id,
    (oldAction, newAction) => ({
      ...compareCommonActionFields(oldAction, newAction),
      status: changeForNonMandatorySimpleProperty(
        oldAction.status,
        newAction.status,
      ) as SimpleTrackedProperty<ActionStatus> | null,
      lastUpdated: changeForNonMandatorySimpleProperty(
        oldAction.lastUpdated ?? null,
        newAction.lastUpdated ?? null,
      ),
      lastUpdatedBy: changeForNonMandatorySimpleProperty(
        oldAction.lastUpdatedBy ?? null,
        newAction.lastUpdatedBy ?? null,
      ),
    }),
  );
}

function compareScenarios5X(
  oldScenarios: RiSc5XScenario[],
  newScenarios: RiSc5XScenario[],
): TrackedProperty<RiSc5XScenarioChange, RiSc5XScenario>[] {
  return changeForListOfComplexProperty(
    oldScenarios,
    newScenarios,
    scenario => scenario.id,
    (oldScenario, newScenario) => ({
      ...compareCommonScenarioFields(oldScenario, newScenario),
      vulnerabilities: changeForListOfSimpleProperty(
        oldScenario.vulnerabilities,
        newScenario.vulnerabilities,
      ) as SimpleTrackedProperty<Vulnerability>[],
      actions: compareActions5X(oldScenario.actions, newScenario.actions),
    }),
  );
}

export function comparison5X(
  updatedRiSc: RiSc5X,
  migratedOldRiSc: RiSc5X,
  migrationStatus: MigrationStatus,
): RiSc5XChange {
  return {
    type: '5.*',
    ...compareCommonRiScFields(migratedOldRiSc, updatedRiSc, migrationStatus),
    scenarios: compareScenarios5X(
      migratedOldRiSc.scenarios,
      updatedRiSc.scenarios,
    ),
  };
}

// ─── v4.x Comparison ───────────────────────────────────────────────────────────

function compareActions4X(
  oldActions: RiSc4XAction[],
  newActions: RiSc4XAction[],
): TrackedProperty<RiSc4XActionChange, RiSc4XAction>[] {
  return changeForListOfComplexProperty(
    oldActions,
    newActions,
    action => action.id,
    (oldAction, newAction) => ({
      ...compareCommonActionFields(oldAction, newAction),
      status: changeForNonMandatorySimpleProperty(
        oldAction.status,
        newAction.status,
      ) as SimpleTrackedProperty<ActionStatus3X4X> | null,
      lastUpdated: changeForNonMandatorySimpleProperty(
        oldAction.lastUpdated ?? null,
        newAction.lastUpdated ?? null,
      ),
    }),
  );
}

function compareScenarios4X(
  oldScenarios: RiSc4XScenario[],
  newScenarios: RiSc4XScenario[],
): TrackedProperty<RiSc4XScenarioChange, RiSc4XScenario>[] {
  return changeForListOfComplexProperty(
    oldScenarios,
    newScenarios,
    scenario => scenario.id,
    (oldScenario, newScenario) => ({
      ...compareCommonScenarioFields(oldScenario, newScenario),
      vulnerabilities: changeForListOfSimpleProperty(
        oldScenario.vulnerabilities,
        newScenario.vulnerabilities,
      ) as SimpleTrackedProperty<Vulnerability>[],
      actions: compareActions4X(oldScenario.actions, newScenario.actions),
    }),
  );
}

export function comparison4X(
  updatedRiSc: RiSc4X,
  migratedOldRiSc: RiSc4X,
  migrationStatus: MigrationStatus,
): RiSc4XChange {
  return {
    type: '4.*',
    ...compareCommonRiScFields(migratedOldRiSc, updatedRiSc, migrationStatus),
    scenarios: compareScenarios4X(
      migratedOldRiSc.scenarios,
      updatedRiSc.scenarios,
    ),
  };
}

// ─── v3.x Comparison ───────────────────────────────────────────────────────────

function compareActions3X(
  oldActions: RiSc3XAction[],
  newActions: RiSc3XAction[],
): TrackedProperty<RiSc3XActionChange, RiSc3XAction>[] {
  return changeForListOfComplexProperty(
    oldActions,
    newActions,
    action => action.id,
    (oldAction, newAction) => ({
      ...compareCommonActionFields(oldAction, newAction),
      status: changeForNonMandatorySimpleProperty(
        oldAction.status,
        newAction.status,
      ) as SimpleTrackedProperty<ActionStatus3X4X> | null,
      deadline: changeForNonMandatorySimpleProperty(
        oldAction.deadline ?? null,
        newAction.deadline ?? null,
      ),
      owner: changeForNonMandatorySimpleProperty(
        oldAction.owner ?? null,
        newAction.owner ?? null,
      ),
    }),
  );
}

function compareScenarios3X(
  oldScenarios: RiSc3XScenario[],
  newScenarios: RiSc3XScenario[],
): TrackedProperty<RiSc3XScenarioChange, RiSc3XScenario>[] {
  return changeForListOfComplexProperty(
    oldScenarios,
    newScenarios,
    scenario => scenario.id,
    (oldScenario, newScenario) => ({
      ...compareCommonScenarioFields(oldScenario, newScenario),
      vulnerabilities: changeForListOfSimpleProperty(
        oldScenario.vulnerabilities,
        newScenario.vulnerabilities,
      ) as SimpleTrackedProperty<Vulnerability3X>[],
      actions: compareActions3X(oldScenario.actions, newScenario.actions),
      existingActions: changeForNonMandatorySimpleProperty(
        oldScenario.existingActions ?? null,
        newScenario.existingActions ?? null,
      ),
    }),
  );
}

export function comparison3X(
  updatedRiSc: RiSc3X,
  migratedOldRiSc: RiSc3X,
  migrationStatus: MigrationStatus,
): RiSc3XChange {
  return {
    type: '3.*',
    ...compareCommonRiScFields(migratedOldRiSc, updatedRiSc, migrationStatus),
    scenarios: compareScenarios3X(
      migratedOldRiSc.scenarios,
      updatedRiSc.scenarios,
    ),
  };
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Compares the updated RiSc to the old RiSc. Migrates the old RiSc to the
 * version of the updated RiSc before comparing. Scenarios are matched by ID.
 *
 * @param updatedRiSc The newest version of the RiSc.
 * @param oldRiSc The old version to compare against (will be migrated).
 * @param lastPublished Optional last published metadata.
 * @throws ComparisonError If the RiSc version is unsupported or migration fails.
 */
export function compare(
  updatedRiSc: RiScDocument,
  oldRiSc: RiScDocument,
  lastPublished?: LastPublished | null,
): RiScChange {
  const updatedVersion = updatedRiSc.schemaVersion;
  const majorVersion = getMajorVersion(updatedVersion);

  let migratedDoc: RiScJson;
  let migrationStatus: MigrationStatus;
  try {
    [migratedDoc, migrationStatus] = migrate(
      oldRiSc as unknown as RiScJson,
      lastPublished ?? undefined,
      updatedVersion,
    );
  } catch (e) {
    throw new ComparisonError(
      `The comparison failed due to migration failure of the old RiSc: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  switch (majorVersion) {
    case 5:
      return comparison5X(
        updatedRiSc as RiSc5X,
        migratedDoc as unknown as RiSc5X,
        migrationStatus,
      );
    case 4:
      return comparison4X(
        updatedRiSc as RiSc4X,
        migratedDoc as unknown as RiSc4X,
        migrationStatus,
      );
    case 3:
      return comparison3X(
        updatedRiSc as RiSc3X,
        migratedDoc as unknown as RiSc3X,
        migrationStatus,
      );
    default:
      throw new ComparisonError(
        `The version '${updatedVersion}' of the RiSc is unknown and not supported for comparison.`,
      );
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getMajorVersion(schemaVersion: string): number {
  const major = parseInt(schemaVersion.split('.')[0], 10);
  return isNaN(major) ? 0 : major;
}

/** Deep equality check for comparing JSON-serializable values. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (a === undefined || b === undefined) return a === b;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}
