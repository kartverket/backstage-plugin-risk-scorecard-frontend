/**
 * Modify one key on an object type. Modify takes 3 type arguments. First one takes the original type you want to modify. Second is the specific key you want to modify. Third is the new type for that key.
 * @template {object} O Which object type to use as basis
 * @template {string} K Key of field in object to modify
 * @template R New type to set field of key to
 */
export type Modify<O, K extends keyof any, R> = Omit<O, K> & { [P in K]: R };

export type RiScWithMetadata = {
  id: string;
  status: RiScStatus;
  content: RiSc;
  isRequiresNewApproval?: boolean;
  pullRequestUrl?: string;
  schemaVersion?: string;
  migrationStatus?: MigrationStatus;
};

export type GenerateInitialRiScBody = {
  publicAgeKey: string | null;
  gcpProjectId: string;
};

export type MigrationStatus = {
  migrationChanges: boolean;
  migrationRequiresNewApproval: boolean;
  migrationVersions?: MigrationVersions;
};

export type MigrationVersions = {
  fromVersion: string;
  toVersion: string;
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
}

export enum ProcessingStatus {
  RiScNotValid = 'RiScNotValid',
  EncryptionFailed = 'EncryptionFailed',
  CouldNotCreateBranch = 'CouldNotCreateBranch',
  UpdatedRiSc = 'UpdatedRiSc',
  UpdatedRiScRequiresNewApproval = 'UpdatedRiScRequiresNewApproval',
  UpdatedRiScAndCreatedPullRequest = 'UpdatedRiScAndCreatedPullRequest',
  CreatedRiSc = 'CreatedRiSc',
  InitializedRiSc = 'InitializedRiSc',
  CreatedPullRequest = 'CreatedPullRequest',
  ErrorWhenCreatingRiSc = 'ErrorWhenCreatingRiSc',
  ErrorWhenUpdatingRiSc = 'ErrorWhenUpdatingRiSc',
  ErrorWhenPublishingRiSc = 'ErrorWhenPublishingRiSc',
  ErrorWhenNoWriteAccessToRepository = 'ErrorWhenNoWriteAccessToRepository',
  ErrorWhenFetchingRiScs = 'ErrorWhenFetchingRiScs',
  ErrorWhenCreatingPullRequest = 'ErrorWhenCreatingPullRequest',
  ErrorWhenGeneratingInitialRiSc = 'Error when generating initial risk scorecard',
}

export enum ContentStatus {
  Success = 'Success',
  Failure = 'Failure',
  FileNotFound = 'FileNotFound',
  DecryptionFailed = 'DecryptionFailed',
  NoReadAccess = 'NoReadAccess',
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
  entriesOnLeft: string[];
  entriesOnRight: string[];
  difference: string[];
};

export type DifferenceDTO = {
  status:
    | 'Success'
    | 'GithubFailure'
    | 'JsonFailure'
    | 'DecryptionFailure'
    | 'NoReadAccess'
    | 'GithubFileNotFound'
    | 'FrontendFallback';
  differenceState: Difference;
  errorMessage?: string;
  defaultLastModifiedDateString: string;
};

export type DifferenceFetchState = Modify<
  DifferenceDTO,
  'status',
  DifferenceDTO['status'] | null
> & { isLoading: boolean; currentDifferenceId: string };
