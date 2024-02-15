export type RosIdentifierResponseDTO = {
  status: string;
  rosIds: RosIdentifier[];
};

export type RosIdentifier = {
  id: string;
  status: RosStatus;
};

export enum RosStatus {
  Draft = 'Draft',
  Published = 'Published',
  SentForApproval = 'SentForApproval',
}

export type ROSContentResultDTO = {
  status: ROSProcessingStatus;
  rosContent: string | null;
  rosId: string;
};

export type ROSProcessResultDTO = {
  status: ROSProcessingStatus;
  statusMessage: string;
  rosContent: string | null;
  rosId: string | null;
};

export enum ROSProcessingStatus {
  ROSNotValid = 'ROSNotValid',
  EncryptionFailed = 'EncryptionFailed',
  CouldNotCreateBranch = 'CouldNotCreateBranch',
  UpdatedROS = 'UpdatedROS',
  ErrorWhenUpdatingROS = 'ErrorWhenUpdatingROS',
}
