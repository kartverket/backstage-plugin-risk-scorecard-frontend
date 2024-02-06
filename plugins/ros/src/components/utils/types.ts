export type RosIdentifierResponseDTO = {
  status: String;
  rosIds: RosIdentifier[];
};

export type RosIdentifier = {
  id: string;
  status: RosStatus;
};

export enum RosStatus {
  Draft,
  Published,
  SentForApproval,
}

export type ROSContentResultDTO = {
  status: string;
  rosContent: string | null;
  rosId: string;
};

export type ROSProcessResultDTO = {
  status: string;
  statusMessage: string;
  rosContent: string | null;
  rosId: string | null;
};
