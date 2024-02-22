export type ProcessROSResultDTO = {
  rosId: string;
  status: ProcessingStatus;
  statusMessage: string;
};

export type PublishROSResultDTO = {
  rosId: string;
  status: ProcessingStatus;
  statusMessage: string;
  pendingApproval?: PendingApprovalDTO;
};

type PendingApprovalDTO = {
  pullRequestUrl: string;
  pullRequestName: string;
};

export type ROSContentResultDTO = {
  rosStatus: RosStatus;
  rosContent: string;
} & ProcessROSResultDTO;

export type ROSWithMetadata = {
  id: string;
  title: string;
  status: RosStatus;
  content: ROS;
};

export type ROS = {
  skjemaVersjon: string;
  tittel: string;
  omfang: string;
  scenarier: Scenario[];
};

export type Scenario = {
  ID: string;
  tittel: string;
  url?: string;
  sistEndret: string;
  beskrivelse: string;
  trusselaktører: string[];
  sårbarheter: string[];
  risiko: Risiko;
  tiltak: Tiltak[];
  restrisiko: Risiko;
};

export type Risiko = {
  oppsummering: string;
  sannsynlighet: number;
  konsekvens: number;
};

export type Tiltak = {
  ID: string;
  beskrivelse: string;
  tiltakseier: string;
  frist: string;
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

export enum RosStatus {
  Draft = 'Draft',
  Published = 'Published',
  SentForApproval = 'SentForApproval',
}

export enum ProcessingStatus {
  ROSNotValid = 'ROSNotValid',
  EncryptionFailed = 'EncryptionFailed',
  CouldNotCreateBranch = 'CouldNotCreateBranch',
  UpdatedROS = 'UpdatedROS',
  CreatedROS = 'CreatedROS',
  CreatedPullRequest = 'CreatedPullRequest',
  ErrorWhenCreatingROS = 'ErrorWhenCreatingROS',
  ErrorWhenUpdatingROS = 'ErrorWhenUpdatingROS',
  ErrorWhenPublishingROS = 'ErrorWhenPublishingROS',
  ErrorWhenFetchingROSes = 'ErrorWhenFetchingROSes',
  ErrorWhenCreatingPullRequest = 'ErrorWhenCreatingPullRequest',
}
