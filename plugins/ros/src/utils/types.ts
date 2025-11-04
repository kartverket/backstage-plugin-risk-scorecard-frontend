import type { Dispatch } from 'react';
import { ActionsDTO, ScenarioDTO, SopsConfigDTO } from './DTOs';
import { ActionStatusOptions } from './constants';

/**
 * Modify one key on an object type. Modify takes 3 type arguments. First one takes the original type you want to modify. Second is the specific key you want to modify. Third is the new type for that key.
 * @template {object} O Which object type to use as basis
 * @template {string} K Key of field in object to modify
 * @template R New type to set field of key to
 */
export type Modify<O, K extends keyof any, R> = Omit<O, K> & { [P in K]: R };

/** Type of the setter from `useState` */
export type SetState<T extends any> = Dispatch<React.SetStateAction<T>>;

export type LastPublished = {
  dateTime: Date;
  numberOfCommits: number;
};

export type RiScWithMetadata = {
  id: string;
  status: RiScStatus;
  content: RiSc;
  sopsConfig: SopsConfigDTO;
  isRequiresNewApproval?: boolean;
  pullRequestUrl?: string;
  schemaVersion?: string;
  migrationStatus?: MigrationStatus;
  lastPublished?: LastPublished;
};

export type DefaultRiScTypeDescriptor = {
  id: string;
  listName: string;
  listDescription: string;
  defaultTitle: string;
  defaultScope: string;
  numberOfScenarios: number | null;
  numberOfActions: number | null;
  preferredBackstageComponentType: string | null;
  priorityIndex: number | null;
};

export type MigrationStatus = {
  migrationChanges: boolean;
  migrationRequiresNewApproval: boolean;
  migrationVersions?: MigrationVersions;
  migrationChanges40?: MigrationChanges40;
  migrationChanges41?: MigrationChanges41;
  migrationChanges42?: MigrationChanges42;
  migrationChanges50?: MigrationChanges50;
};

export type MigrationVersions = {
  fromVersion: string;
  toVersion: string;
};

export type MigrationChanges50 = {
  scenarios: MigrationChanges50Scenario[];
};

export type MigrationChanges50Scenario = {
  title: string;
  id: string;
  changedActions: MigrationChanges50Action[];
};

export type MigrationChanges50Action = {
  title: string;
  id: string;
  changedActionStatus: MigrationChangedTypedValue<
    ActionStatusOptionsV4,
    ActionStatusOptions
  >;
};

export type MigrationChanges42 = {
  scenarios: MigrationChanges42Scenario[];
};

export type MigrationChanges42Scenario = {
  title: string;
  id: string;
  changedActions: MigrationChanges42Action[];
};

export type MigrationChanges42Action = {
  title: string;
  id: string;
  lastUpdated?: Date | null;
};

export type MigrationChanges41 = {
  scenarios: MigrationChanges41Scenario[];
};

export type MigrationChanges41Scenario = {
  title: string;
  id: string;
  changedRiskConsequence?: MigrationChangedValue<number>;
  changedRiskProbability?: MigrationChangedValue<number>;
  changedRemainingRiskConsequence?: MigrationChangedValue<number>;
  changedRemainingRiskProbability?: MigrationChangedValue<number>;
};

export type MigrationChanges40 = {
  scenarios: MigrationChanges40Scenario[];
};

export type MigrationChanges40Scenario = {
  title: string;
  id: string;
  removedExistingActions?: string;
  changedVulnerabilities: MigrationChangedValue<string>[];
  changedActions: MigrationChanges40Action[];
};

export type MigrationChanges40Action = {
  title: string;
  id: string;
  removedOwner?: string;
  removedDeadline?: string;
};

export type MigrationChangedValue<T> = {
  oldValue: T;
  newValue: T;
};

export type MigrationChangedTypedValue<S, T> = {
  oldValue: S;
  newValue: T;
};

export type RiSc = {
  schemaVersion: string;
  title: string;
  scope: string;
  valuations: Valuations[];
  scenarios: Scenario[];
};

export type Valuations = {
  description: string;
  confidentiality: string;
  integrity: string;
  availability: string;
};

export type Scenario = {
  ID: string;
  title: string;
  url?: string;
  description: string;
  threatActors: string[];
  vulnerabilities: string[];
  risk: Risk;
  remainingRisk: Risk;
  actions: Action[];
};

export type Risk = {
  summary: string;
  probability: number;
  consequence: number;
};

export type Action = {
  ID: string;
  title: string;
  description: string;
  status: string;
  url: string;
  lastUpdated?: Date | null;
};

export type GithubRepoInfo = {
  name: string;
  owner: string;
};

export type SubmitResponseObject = {
  status: ProcessingStatus;
  statusMessage: string;
};

export enum RiScStatus {
  Draft = 'Draft',
  Published = 'Published',
  SentForApproval = 'SentForApproval',
  DeletionDraft = 'DeletionDraft',
  DeletionSentForApproval = 'DeletionSentForApproval',
}

export enum ProcessingStatus {
  RiScNotValid = 'RiScNotValid',
  EncryptionFailed = 'EncryptionFailed',
  CouldNotCreateBranch = 'CouldNotCreateBranch',
  UpdatedRiSc = 'UpdatedRiSc',
  DeletedRiSc = 'DeletedRiSc',
  DeletedRiScRequiresApproval = 'DeletedRiScRequiresApproval',
  UpdatedSops = 'UpdatedSops',
  UpdatedRiScRequiresNewApproval = 'UpdatedRiScRequiresNewApproval',
  UpdatedRiScAndCreatedPullRequest = 'UpdatedRiScAndCreatedPullRequest',
  CreatedRiSc = 'CreatedRiSc',
  OpenedPullRequest = 'OpenedPullRequest',
  CreatedPullRequest = 'CreatedPullRequest',
  ErrorWhenCreatingRiSc = 'ErrorWhenCreatingRiSc',
  ErrorWhenUpdatingRiSc = 'ErrorWhenUpdatingRiSc',
  ErrorWhenDeletingRiSc = 'ErrorWhenDeletingRiSc',
  ErrorWhenPublishingRiSc = 'ErrorWhenPublishingRiSc',
  ErrorWhenNoWriteAccessToRepository = 'ErrorWhenNoWriteAccessToRepository',
  ErrorWhenFetchingRiScs = 'ErrorWhenFetchingRiScs',
  ErrorWhenCreatingPullRequest = 'ErrorWhenCreatingPullRequest',
  ErrorWhenFetchingGcpCryptoKeys = 'ErrorWhenFetchingGcpCryptoKeys',
  FailedToFetchGcpProjectIds = 'Failed to fetch GCP project IDs',
}

export enum ContentStatus {
  Success = 'Success',
  Deleted = 'Deleted',
  Failure = 'Failure',
  FileNotFound = 'FileNotFound',
  DecryptionFailed = 'DecryptionFailed',
  NoReadAccess = 'NoReadAccess',
}

export enum DifferenceStatus {
  Success = 'Success',
  GithubFileNotFound = 'GithubFileNotFound',
  FrontendFallback = 'FrontendFallback',
}

export enum ActionStatusOptionsV4 {
  NotStarted = 'Not started',
  InProgress = 'In progress',
  OnHold = 'On hold',
  Completed = 'Completed',
  Aborted = 'Aborted',
}

type FormRisk = Modify<
  Modify<Risk, 'probability', string>,
  'consequence',
  string
>;

export type FormScenario = Modify<
  Modify<Scenario, 'risk', FormRisk>,
  'remainingRisk',
  FormRisk
>;

export type Difference = {
  type: '4.*';
  migrationChanges: MigrationStatus;
  title?: SimpleTrackedProperty<string>;
  scope?: SimpleTrackedProperty<string>;
  valuations: SimpleTrackedProperty<Valuations>[];
  scenarios: TrackedProperty<ScenarioChange, ScenarioDTO>[];
};

export type ScenarioChange = {
  title: SimpleTrackedProperty<string>;
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null>;
  threatActors: SimpleTrackedProperty<string>[];
  vulnerabilities: SimpleTrackedProperty<string>[];
  risk: SimpleTrackedProperty<ScenarioRiskChange>;
  remainingRisk: SimpleTrackedProperty<ScenarioRiskChange>;
  actions: TrackedProperty<ActionChange, ActionsDTO>[];
};

export type ActionChange = {
  title: SimpleTrackedProperty<string>;
  // The id will never change
  id: string;
  description: SimpleTrackedProperty<string>;
  url?: SimpleTrackedProperty<string | null>;
  status?: SimpleTrackedProperty<string>;
  lastUpdated?: SimpleTrackedProperty<Date | null>;
};

export type ScenarioRiskChange = {
  summary?: SimpleTrackedProperty<string | null>;
  probability: SimpleTrackedProperty<number>;
  consequence: SimpleTrackedProperty<number>;
};

export type SimpleTrackedProperty<T> = TrackedProperty<T, T>;

export type TrackedProperty<S, T> =
  | AddedProperty<T>
  | ChangedProperty<S>
  | ContentChangedProperty<S>
  | DeletedProperty<T>
  | UnchangedProperty<T>;

export type AddedProperty<T> = {
  type: 'ADDED';
  newValue: T;
};

export type ChangedProperty<S> = {
  type: 'CHANGED';
  oldValue: S;
  newValue: S;
};

export type ContentChangedProperty<S> = {
  type: 'CONTENT_CHANGED';
  value: S;
};

export type DeletedProperty<T> = {
  type: 'DELETED';
  oldValue: T;
};

export type UnchangedProperty<T> = {
  type: 'UNCHANGED';
  value: T;
};

export type DifferenceDTO = {
  status: DifferenceStatus;
  differenceState: Difference;
  errorMessage?: string;
  defaultLastModifiedDateString: string;
};

export type DifferenceFetchState = Modify<
  DifferenceDTO,
  'status',
  DifferenceStatus | null
> & { isLoading: boolean; currentDifferenceId: string };
