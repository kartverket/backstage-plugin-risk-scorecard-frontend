export type ROSWithMetadata = {
  id: string;
  status: RosStatus;
  content: ROS;
  isRequiresNewApproval?: boolean;
};

export type ROS = {
  skjemaVersjon: string;
  tittel: string;
  omfang: string;
  verdivurderinger: Verdivurdering[];
  scenarier: Scenario[];
};

export type Verdivurdering = {
  beskrivelse: string;
  konfidensialitet: string;
  integritet: string;
  tilgjengelighet: string;
};

export type Scenario = {
  ID: string;
  tittel: string;
  url?: string;
  beskrivelse: string;
  trusselaktører: string[];
  sårbarheter: string[];
  risiko: Risiko;
  eksisterendeTiltak: string;
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
  tittel: string;
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
  ErrorWhenFetchingJSONSchema = 'ErrorWhenFetchingJSONSchema',
}
