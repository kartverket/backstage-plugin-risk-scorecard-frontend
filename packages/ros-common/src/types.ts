/**
 * Core domain types for the RiSc plugin ecosystem.
 * Shared between the backend plugin and the frontend plugin.
 *
 * Ported from the Kotlin backend models:
 *   - risc/models/RiSc.kt (versioned domain models)
 *   - risc/models/DTOs.kt (status enums, result types)
 *   - utils/comparison/ComparisonDTOs.kt (change tracking)
 *   - utils/comparison/MigrationDTOs.kt (migration changes)
 */

import type { RiScVersion } from './constants';

// ─── Status Enums ──────────────────────────────────────────────────────────────

/** Processing status returned by write operations (create/update/delete/publish). */
export const ProcessingStatus = {
  CreatedRiSc: 'CreatedRiSc',
  UpdatedRiSc: 'UpdatedRiSc',
  DeletedRiSc: 'DeletedRiSc',
  DeletedRiScRequiresApproval: 'DeletedRiScRequiresApproval',
  UpdatedRiScAndCreatedPullRequest: 'UpdatedRiScAndCreatedPullRequest',
  CreatedPullRequest: 'CreatedPullRequest',
  UpdatedRiScRequiresNewApproval: 'UpdatedRiScRequiresNewApproval',
  ErrorWhenUpdatingRiSc: 'ErrorWhenUpdatingRiSc',
  ErrorWhenCreatingRiSc: 'ErrorWhenCreatingRiSc',
  ErrorWhenDeletingRiSc: 'ErrorWhenDeletingRiSc',
  ErrorWhenCreatingPullRequest: 'ErrorWhenCreatingPullRequest',
  InvalidAccessTokens: 'InvalidAccessTokens',
  InvalidGcpAccessToken: 'InvalidGcpAccessToken',
  InvalidGitHubAccessToken: 'InvalidGitHubAccessToken',
  NoWriteAccessToRepository: 'NoWriteAccessToRepository',
  AccessTokensValidationFailure: 'AccessTokensValidationFailure',
  FailedToFetchGcpProjectIds: 'FailedToFetchGcpProjectIds',
  FailedToFetchGCPOAuth2TokenInformation:
    'FailedToFetchGCPOAuth2TokenInformation',
  FailedToFetchGCPIAMPermissions: 'FailedToFetchGCPIAMPermissions',
  FailedToCreateSops: 'FailedToCreateSops',
  FailedToFetchFromAirtable: 'FailedToFetchFromAirtable',
  FailedToFetchInitRiScFromGitHub: 'FailedToFetchInitRiScFromGitHub',
  FailedToFetchInitRiScConfigFromGitHub:
    'FailedToFetchInitRiScConfigFromGitHub',
} as const;

export type ProcessingStatus =
  (typeof ProcessingStatus)[keyof typeof ProcessingStatus];

/** Lifecycle status of a RiSc document. */
export const RiScStatus = {
  Draft: 'Draft',
  SentForApproval: 'SentForApproval',
  Published: 'Published',
  DeletionDraft: 'DeletionDraft',
  DeletionSentForApproval: 'DeletionSentForApproval',
  Deleted: 'Deleted',
} as const;

export type RiScStatus = (typeof RiScStatus)[keyof typeof RiScStatus];

/** Content fetch status — indicates the result of reading a RiSc from storage. */
export const ContentStatus = {
  Success: 'Success',
  FileNotFound: 'FileNotFound',
  DecryptionFailed: 'DecryptionFailed',
  Failure: 'Failure',
  NoReadAccess: 'NoReadAccess',
  SchemaNotFound: 'SchemaNotFound',
  SchemaValidationFailed: 'SchemaValidationFailed',
  UnsupportedMigration: 'UnsupportedMigration',
} as const;

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

/** Status of a difference/comparison operation. */
export const DifferenceStatus = {
  Success: 'Success',
  GithubFailure: 'GithubFailure',
  GithubFileNotFound: 'GithubFileNotFound',
  JsonFailure: 'JsonFailure',
  DecryptionFailure: 'DecryptionFailure',
  NoReadAccess: 'NoReadAccess',
  SchemaNotFound: 'SchemaNotFound',
  SchemaValidationFailed: 'SchemaValidationFailed',
  UnsupportedMigration: 'UnsupportedMigration',
} as const;

export type DifferenceStatus =
  (typeof DifferenceStatus)[keyof typeof DifferenceStatus];

// ─── Domain Enums ──────────────────────────────────────────────────────────────

/** Threat actors (v3.x through v5.x). */
export const ThreatActor = {
  'Script kiddie': 'Script kiddie',
  Hacktivist: 'Hacktivist',
  'Reckless employee': 'Reckless employee',
  Insider: 'Insider',
  'Organised crime': 'Organised crime',
  'Terrorist organisation': 'Terrorist organisation',
  'Nation/government': 'Nation/government',
} as const;

export type ThreatActor = (typeof ThreatActor)[keyof typeof ThreatActor];

/** Vulnerabilities (v4.x and v5.x). */
export const Vulnerability = {
  'Flawed design': 'Flawed design',
  Misconfiguration: 'Misconfiguration',
  'Dependency vulnerability': 'Dependency vulnerability',
  'Unauthorized access': 'Unauthorized access',
  'Unmonitored use': 'Unmonitored use',
  'Input tampering': 'Input tampering',
  'Information leak': 'Information leak',
  'Excessive use': 'Excessive use',
} as const;

export type Vulnerability = (typeof Vulnerability)[keyof typeof Vulnerability];

/** Vulnerabilities (v3.x only — replaced in v4.0). */
export const Vulnerability3X = {
  'Compromised admin user': 'Compromised admin user',
  'Dependency vulnerability': 'Dependency vulnerability',
  'Disclosed secret': 'Disclosed secret',
  Misconfiguration: 'Misconfiguration',
  'Input tampering': 'Input tampering',
  'User repudiation': 'User repudiation',
  'Information leak': 'Information leak',
  'Denial of service': 'Denial of service',
  'Escalation of rights': 'Escalation of rights',
} as const;

export type Vulnerability3X =
  (typeof Vulnerability3X)[keyof typeof Vulnerability3X];

/** Action status (v5.x). */
export const ActionStatus = {
  OK: 'OK',
  'Not OK': 'Not OK',
  'Not relevant': 'Not relevant',
} as const;

export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

/** Action status (v3.x and v4.x — replaced in v5.0). */
export const ActionStatus3X4X = {
  'Not started': 'Not started',
  'In progress': 'In progress',
  'On hold': 'On hold',
  Completed: 'Completed',
  Aborted: 'Aborted',
} as const;

export type ActionStatus3X4X =
  (typeof ActionStatus3X4X)[keyof typeof ActionStatus3X4X];

/** Valuation: confidentiality classification (deprecated in v5.2+). */
export const ValuationConfidentiality = {
  Public: 'Public',
  Internal: 'Internal',
  Confidential: 'Confidential',
  'Strictly confidential': 'Strictly confidential',
} as const;

export type ValuationConfidentiality =
  (typeof ValuationConfidentiality)[keyof typeof ValuationConfidentiality];

/** Valuation: integrity classification (deprecated in v5.2+). */
export const ValuationIntegrity = {
  Insignificant: 'Insignificant',
  Expected: 'Expected',
  Dependent: 'Dependent',
  Critical: 'Critical',
} as const;

export type ValuationIntegrity =
  (typeof ValuationIntegrity)[keyof typeof ValuationIntegrity];

/** Valuation: availability classification (deprecated in v5.2+). */
export const ValuationAvailability = {
  Insignificant: 'Insignificant',
  '2 days': '2 days',
  '4 hours': '4 hours',
  Immediate: 'Immediate',
} as const;

export type ValuationAvailability =
  (typeof ValuationAvailability)[keyof typeof ValuationAvailability];

// ─── Domain Models ─────────────────────────────────────────────────────────────

/** Risk assessment with probability and consequence. */
export interface RiScRisk {
  summary?: string | null;
  probability: number;
  consequence: number;
}

/** Asset valuation (deprecated in v5.2+). */
export interface RiScValuation {
  description: string;
  confidentiality: ValuationConfidentiality;
  integrity: ValuationIntegrity;
  availability: ValuationAvailability;
}

/** An identifier for a RiSc, used in list views. */
export interface RiScIdentifier {
  id: string;
  status: RiScStatus;
  pullRequestUrl?: string | null;
}

/** User info attached to operations. */
export interface UserInfo {
  name: string;
  email: string;
}

/** Last published metadata. */
export interface LastPublished {
  dateTime: string;
  numberOfCommits: number;
}

// ─── Versioned RiSc Models ─────────────────────────────────────────────────────

/** Base RiSc structure shared across all versions. */
export interface RiScBase<TVersion extends RiScVersion = RiScVersion> {
  schemaVersion: TVersion;
  title: string;
  scope: string;
  valuations?: RiScValuation[] | null;
  sops?: Record<string, unknown> | null;
}

/** v5.x scenario action. */
export interface RiSc5XAction {
  title: string;
  action: {
    ID: string;
    description: string;
    url?: string | null;
    status: ActionStatus;
    lastUpdated?: string | null;
    lastUpdatedBy?: string | null;
    comment?: string | null;
  };
}

/** v5.x scenario. */
export interface RiSc5XScenario {
  title: string;
  scenario: {
    ID: string;
    description: string;
    url?: string | null;
    threatActors: ThreatActor[];
    vulnerabilities: Vulnerability[];
    risk: RiScRisk;
    remainingRisk: RiScRisk;
    actions: RiSc5XAction[];
  };
}

export interface RiSc5XUnencryptedMetadata {
  appliesTo?: string[] | null;
}

/** v5.x RiSc document. */
export interface RiSc5X extends RiScBase<
  Extract<RiScVersion, '5.0' | '5.1' | '5.2' | '5.3' | '5.4'>
> {
  unencryptedMetadata?: RiSc5XUnencryptedMetadata | null;
  scenarios: RiSc5XScenario[];
}

/** v4.x scenario action. */
export interface RiSc4XAction {
  title: string;
  action: {
    ID: string;
    description: string;
    url?: string | null;
    status: ActionStatus3X4X;
    lastUpdated?: string | null;
  };
}

/** v4.x scenario. */
export interface RiSc4XScenario {
  title: string;
  scenario: {
    ID: string;
    description: string;
    url?: string | null;
    threatActors: ThreatActor[];
    vulnerabilities: Vulnerability[];
    risk: RiScRisk;
    remainingRisk: RiScRisk;
    actions: RiSc4XAction[];
  };
}

/** v4.x RiSc document. */
export interface RiSc4X extends RiScBase<
  Extract<RiScVersion, '4.0' | '4.1' | '4.2'>
> {
  scenarios: RiSc4XScenario[];
}

/** v3.x scenario action. */
export interface RiSc3XAction {
  title: string;
  action: {
    ID: string;
    description: string;
    url?: string | null;
    status: ActionStatus3X4X;
    deadline?: string | null;
    owner?: string | null;
  };
}

/** v3.x scenario. */
export interface RiSc3XScenario {
  title: string;
  scenario: {
    ID: string;
    description: string;
    url?: string | null;
    threatActors: ThreatActor[];
    vulnerabilities: Vulnerability3X[];
    risk: RiScRisk;
    remainingRisk: RiScRisk;
    actions: RiSc3XAction[];
    existingActions?: string | null;
  };
}

/** v3.x RiSc document. */
export interface RiSc3X extends RiScBase<Extract<RiScVersion, '3.2' | '3.3'>> {
  scenarios: RiSc3XScenario[];
}

/** Union of all versioned RiSc document types. */
export type RiScDocument = RiSc3X | RiSc4X | RiSc5X;

// ─── SOPS Configuration ────────────────────────────────────────────────────────

export interface GcpKmsEntry {
  resource_id: string;
  created_at?: string | null;
  enc?: string | null;
}

export interface AgeEntry {
  recipient: string;
  enc?: string | null;
}

export interface KeyGroup {
  gcp_kms?: GcpKmsEntry[] | null;
  hc_vault?: unknown[] | null;
  age?: AgeEntry[] | null;
}

export interface SopsConfig {
  shamir_threshold: number;
  key_groups?: KeyGroup[] | null;
  kms?: unknown[] | null;
  gcp_kms?: GcpKmsEntry[] | null;
  age?: AgeEntry[] | null;
  lastmodified?: string | null;
  mac?: string | null;
  unencrypted_suffix?: string | null;
  version?: string | null;
}

// ─── Migration Types ───────────────────────────────────────────────────────────

export interface MigrationVersions {
  fromVersion: string | null;
  toVersion: string | null;
}

export interface MigrationStatus {
  migrationChanges: boolean;
  migrationRequiresNewApproval: boolean;
  migrationVersions: MigrationVersions;
  migrationChanges40?: MigrationChange40 | null;
  migrationChanges41?: MigrationChange41 | null;
  migrationChanges42?: MigrationChange42 | null;
  migrationChanges50?: MigrationChange50 | null;
  migrationChanges51?: MigrationChange51 | null;
  migrationChanges52?: MigrationChange52 | null;
}

/** Generic changed value (same type before/after). */
export interface MigrationChangedValue<T> {
  oldValue: T;
  newValue: T;
}

/** Changed value where old and new have different types. */
export interface MigrationChangedTypedValue<S, T> {
  oldValue: S;
  newValue: T;
}

// v3.3 → 4.0 migration changes
export interface MigrationChange40 {
  scenarios: MigrationChange40Scenario[];
}

export interface MigrationChange40Scenario {
  title: string;
  id: string;
  removedExistingActions?: string | null;
  changedVulnerabilities: MigrationChangedTypedValue<
    Vulnerability3X,
    Vulnerability
  >[];
  changedActions: MigrationChange40Action[];
}

export interface MigrationChange40Action {
  title: string;
  id: string;
  removedOwner?: string | null;
  removedDeadline?: string | null;
}

// v4.0 → 4.1 migration changes
export interface MigrationChange41 {
  scenarios: MigrationChange41Scenario[];
}

export interface MigrationChange41Scenario {
  title: string;
  id: string;
  changedRiskProbability?: MigrationChangedValue<number> | null;
  changedRiskConsequence?: MigrationChangedValue<number> | null;
  changedRemainingRiskProbability?: MigrationChangedValue<number> | null;
  changedRemainingRiskConsequence?: MigrationChangedValue<number> | null;
}

// v4.1 → 4.2 migration changes
export interface MigrationChange42 {
  scenarios: MigrationChange42Scenario[];
}

export interface MigrationChange42Scenario {
  title: string;
  id: string;
  changedActions: MigrationChange42Action[];
}

export interface MigrationChange42Action {
  title: string;
  id: string;
  lastUpdated?: string | null;
}

// v4.2 → 5.0 migration changes
export interface MigrationChange50 {
  scenarios: MigrationChange50Scenario[];
}

export interface MigrationChange50Scenario {
  title: string;
  id: string;
  changedActionStatus: MigrationChangedTypedValue<
    ActionStatus3X4X,
    ActionStatus
  >[];
  changedActions: MigrationChange50Action[];
}

export interface MigrationChange50Action {
  title: string;
  id: string;
  changedActionStatus: MigrationChangedTypedValue<
    ActionStatus3X4X,
    ActionStatus
  >;
}

// v5.0 → 5.1 migration changes
export interface MigrationChange51 {
  scenarios: MigrationChange51Scenario[];
}

export interface MigrationChange51Scenario {
  title: string;
  id: string;
  changedActions: MigrationChange51Action[];
}

export interface MigrationChange51Action {
  title: string;
  id: string;
  lastUpdatedBy?: string | null;
}

// v5.1 → 5.2 migration changes
export interface MigrationChange52 {
  removedValuationsCount: number;
}

// ─── Change Tracking (Comparison DTOs) ─────────────────────────────────────────

/**
 * Discriminated union representing how a tracked property changed.
 * Uses a `type` discriminator for JSON serialization compatibility.
 */
export type TrackedProperty<S, T> =
  | AddedProperty<T>
  | ChangedProperty<S>
  | ContentChangedProperty<S>
  | DeletedProperty<T>
  | UnchangedProperty<T>;

/** Shorthand when the change-tracking type is the same for all variants. */
export type SimpleTrackedProperty<T> = TrackedProperty<T, T>;

export interface AddedProperty<T> {
  type: 'ADDED';
  newValue: T;
}

export interface ChangedProperty<S> {
  type: 'CHANGED';
  oldValue: S | null;
  newValue: S | null;
}

export interface ContentChangedProperty<S> {
  type: 'CONTENT_CHANGED';
  value: S;
}

export interface DeletedProperty<T> {
  type: 'DELETED';
  oldValue: T;
}

export interface UnchangedProperty<T> {
  type: 'UNCHANGED';
  value: T;
}

/** Risk change representation within a diff. */
export interface RiScRiskChange {
  summary?: SimpleTrackedProperty<string | null> | null;
  probability: SimpleTrackedProperty<number>;
  consequence: SimpleTrackedProperty<number>;
}

// ─── v5.x Change Types ─────────────────────────────────────────────────────────

export interface RiSc5XChange {
  type: '5.*';
  title?: SimpleTrackedProperty<string> | null;
  scope?: SimpleTrackedProperty<string> | null;
  appliesTo?: SimpleTrackedProperty<string>[] | null;
  valuations: SimpleTrackedProperty<RiScValuation>[];
  scenarios: TrackedProperty<RiSc5XScenarioChange, RiSc5XScenario>[];
  migrationChanges: MigrationStatus;
}

export interface RiSc5XScenarioChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  threatActors: SimpleTrackedProperty<ThreatActor>[];
  vulnerabilities: SimpleTrackedProperty<Vulnerability>[];
  risk: SimpleTrackedProperty<RiScRiskChange>;
  remainingRisk: SimpleTrackedProperty<RiScRiskChange>;
  actions: TrackedProperty<RiSc5XActionChange, RiSc5XAction>[];
}

export interface RiSc5XActionChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  status?: SimpleTrackedProperty<ActionStatus> | null;
  lastUpdated?: SimpleTrackedProperty<string | null> | null;
  lastUpdatedBy?: SimpleTrackedProperty<string | null> | null;
  comment?: SimpleTrackedProperty<string | null> | null;
}

// ─── v4.x Change Types ─────────────────────────────────────────────────────────

export interface RiSc4XChange {
  type: '4.*';
  title?: SimpleTrackedProperty<string> | null;
  scope?: SimpleTrackedProperty<string> | null;
  valuations: SimpleTrackedProperty<RiScValuation>[];
  scenarios: TrackedProperty<RiSc4XScenarioChange, RiSc4XScenario>[];
  migrationChanges: MigrationStatus;
}

export interface RiSc4XScenarioChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  threatActors: SimpleTrackedProperty<ThreatActor>[];
  vulnerabilities: SimpleTrackedProperty<Vulnerability>[];
  risk: SimpleTrackedProperty<RiScRiskChange>;
  remainingRisk: SimpleTrackedProperty<RiScRiskChange>;
  actions: TrackedProperty<RiSc4XActionChange, RiSc4XAction>[];
}

export interface RiSc4XActionChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  status?: SimpleTrackedProperty<ActionStatus3X4X> | null;
  lastUpdated?: SimpleTrackedProperty<string | null> | null;
}

// ─── v3.x Change Types ─────────────────────────────────────────────────────────

export interface RiSc3XChange {
  type: '3.*';
  title?: SimpleTrackedProperty<string> | null;
  scope?: SimpleTrackedProperty<string> | null;
  valuations?: SimpleTrackedProperty<RiScValuation>[] | null;
  scenarios?: TrackedProperty<RiSc3XScenarioChange, RiSc3XScenario>[] | null;
  migrationChanges: MigrationStatus;
}

export interface RiSc3XScenarioChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  threatActors?: SimpleTrackedProperty<ThreatActor>[] | null;
  vulnerabilities?: SimpleTrackedProperty<Vulnerability3X>[] | null;
  risk: SimpleTrackedProperty<RiScRiskChange>;
  remainingRisk: SimpleTrackedProperty<RiScRiskChange>;
  actions?: TrackedProperty<RiSc3XActionChange, RiSc3XAction>[] | null;
  existingActions?: SimpleTrackedProperty<string | null> | null;
}

export interface RiSc3XActionChange {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null> | null;
  status?: SimpleTrackedProperty<ActionStatus3X4X> | null;
  deadline?: SimpleTrackedProperty<string | null> | null;
  owner?: SimpleTrackedProperty<string | null> | null;
}

/** Union of all versioned RiSc change types. */
export type RiScChange = RiSc3XChange | RiSc4XChange | RiSc5XChange;

// ─── GCP Crypto Key Types ──────────────────────────────────────────────────────

export const CryptoKeyPermission = {
  UNKNOWN: 'UNKNOWN',
  DECRYPT: 'DECRYPT',
  ENCRYPT: 'ENCRYPT',
} as const;

export type CryptoKeyPermission =
  (typeof CryptoKeyPermission)[keyof typeof CryptoKeyPermission];

export interface GcpCryptoKeyObject {
  projectId: string;
  keyRing: string;
  name: string;
  locations: string;
  resourceId: string;
  createdAt: string;
  userPermissions: CryptoKeyPermission[];
}

// ─── GitHub Repository Info ────────────────────────────────────────────────────

export interface GithubRepoInfo {
  owner: string;
  name: string;
}
