/**
 * Core domain types for the RiSc backend plugin.
 * These are shared between the backend plugin and (eventually) the frontend.
 *
 * Full type definitions will be added in T2.
 */

/** Processing status returned alongside API responses. */
export enum ProcessingStatus {
  // Success states
  CreatedRiSc = 'CreatedRiSc',
  UpdatedRiSc = 'UpdatedRiSc',
  DeletedRiSc = 'DeletedRiSc',
  PublishedRiSc = 'PublishedRiSc',
  FetchedRiScs = 'FetchedRiScs',

  // Error states
  ErrorWhenFetchingRiSc = 'ErrorWhenFetchingRiSc',
  ErrorWhenCreatingRiSc = 'ErrorWhenCreatingRiSc',
  ErrorWhenUpdatingRiSc = 'ErrorWhenUpdatingRiSc',
  ErrorWhenDeletingRiSc = 'ErrorWhenDeletingRiSc',
  ErrorWhenPublishingRiSc = 'ErrorWhenPublishingRiSc',
  ErrorWhenValidatingTokens = 'ErrorWhenValidatingTokens',
  ErrorPermissionDenied = 'ErrorPermissionDenied',
  ErrorRepositoryAccess = 'ErrorRepositoryAccess',
  ErrorSchemaValidation = 'ErrorSchemaValidation',
  ErrorSopsDecryption = 'ErrorSopsDecryption',
  ErrorSopsEncryption = 'ErrorSopsEncryption',
}

/** Status of a RiSc in the system. */
export enum RiScStatus {
  Published = 'Published',
  Draft = 'Draft',
  SentForApproval = 'SentForApproval',
}

/** Content status indicating what state a RiSc's content is in. */
export enum ContentStatus {
  /** Content matches what's on the default branch. */
  Published = 'Published',
  /** Content has local modifications on a draft branch. */
  Draft = 'Draft',
  /** A PR exists for this content. */
  SentForApproval = 'SentForApproval',
}

/** Difference status for comparisons. */
export enum DifferenceStatus {
  HasDifference = 'HasDifference',
  NoDifference = 'NoDifference',
}
