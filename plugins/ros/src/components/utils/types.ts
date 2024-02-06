export type RosIdentifierResponseDTO = {
  status: String;
  rosIds: RosIdentifier[];
};

export type RosIdentifier = {
  id: string;
  status: string;
};

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
