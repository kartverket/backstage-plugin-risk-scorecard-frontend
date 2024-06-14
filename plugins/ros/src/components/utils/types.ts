export type RiScWithMetadata = {
  id: string;
  status: RiScStatus;
  content: RiSc;
  isRequiresNewApproval?: boolean;
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
  existingActions: string;
  actions: Action[];
  remainingRisk: Risk;
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
  owner: string;
  deadline: string;
  status: string;
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
  ErrorWhenFetchingJSONSchema = 'ErrorWhenFetchingJSONSchema',
}

export enum ContentStatus {
  Success = 'Success',
  Failure = 'Failure',
  FileNotFound = 'FileNotFound',
  DecryptionFailed = 'DecryptionFailed',
}
