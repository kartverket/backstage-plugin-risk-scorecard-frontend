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
