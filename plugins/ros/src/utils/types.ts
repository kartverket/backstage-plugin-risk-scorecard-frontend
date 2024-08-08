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

export type MigrationStatus = {
  migrationChanges?: boolean;
  migrationRequiresNewApproval?: boolean;
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
  CreatedRiSc = 'CreatedRiSc',
  CreatedPullRequest = 'CreatedPullRequest',
  ErrorWhenCreatingRiSc = 'ErrorWhenCreatingRiSc',
  ErrorWhenUpdatingRiSc = 'ErrorWhenUpdatingRiSc',
  ErrorWhenPublishingRiSc = 'ErrorWhenPublishingRiSc',
  ErrorWhenFetchingRiScs = 'ErrorWhenFetchingRiScs',
  ErrorWhenCreatingPullRequest = 'ErrorWhenCreatingPullRequest',
}

export enum ContentStatus {
  Success = 'Success',
  Failure = 'Failure',
  FileNotFound = 'FileNotFound',
  DecryptionFailed = 'DecryptionFailed',
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
