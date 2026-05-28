import { ProcessingStatus } from '@kartverket/backstage-plugin-ros-common';

/**
 * Base error class for all domain errors in the RiSc backend.
 * Each subclass carries a ProcessingStatus for the frontend and an HTTP status code.
 */
export abstract class DomainError extends Error {
  abstract readonly httpStatus: number;
  abstract readonly processingStatus: ProcessingStatus;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ─── SOPS Errors ──────────────────────────────────────────────────────────────

export type SopsErrorCode =
  | 'MISSING_DATA_KEY'
  | 'NO_MATCHING_KEY'
  | 'AUTHENTICATION_FAILED'
  | 'UNKNOWN';

const ERROR_CODE_MESSAGES: Record<SopsErrorCode, string> = {
  MISSING_DATA_KEY:
    'Failed to get the data key required for decryption. Check that the SOPS key configuration is correct.',
  NO_MATCHING_KEY:
    'No key could decrypt the data. Ensure you have the correct private key or KMS access.',
  AUTHENTICATION_FAILED:
    'Authentication failed when accessing the encryption key. Verify your credentials.',
  UNKNOWN: 'An unknown SOPS error occurred.',
};

export class SopsError extends DomainError {
  readonly httpStatus = 500;
  readonly processingStatus = ProcessingStatus.FailedToCreateSops;
  readonly errorCode: SopsErrorCode;
  readonly errorMessage: string;

  constructor(
    message: string,
    errorCode: SopsErrorCode = 'UNKNOWN',
    public readonly riScId?: string,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.errorMessage = ERROR_CODE_MESSAGES[errorCode];
  }
}

export class SopsDecryptionError extends SopsError {
  constructor(message: string, errorCode: SopsErrorCode = 'UNKNOWN') {
    super(message, errorCode);
    this.name = 'SopsDecryptionError';
  }
}

export class SopsEncryptionError extends SopsError {
  constructor(message: string, riScId?: string) {
    super(message, 'UNKNOWN', riScId);
    this.name = 'SopsEncryptionError';
  }
}

// ─── Other Domain Errors ──────────────────────────────────────────────────────

export class AccessTokenValidationError extends DomainError {
  readonly httpStatus = 401;
  readonly processingStatus = ProcessingStatus.AccessTokensValidationFailure;

  constructor(message = 'Invalid access token') {
    super(message);
  }
}

export class PermissionDeniedError extends DomainError {
  readonly httpStatus = 403;
  readonly processingStatus = ProcessingStatus.NoWriteAccessToRepository;

  constructor(message = 'Permission denied') {
    super(message);
  }
}

export class RepositoryAccessError extends DomainError {
  readonly httpStatus = 403;
  readonly processingStatus = ProcessingStatus.NoWriteAccessToRepository;

  constructor(message = 'Repository access denied') {
    super(message);
  }
}

export class RiScNotValidError extends DomainError {
  readonly httpStatus = 422;
  readonly processingStatus = ProcessingStatus.ErrorWhenUpdatingRiSc;

  constructor(message = 'RiSc content is not valid') {
    super(message);
  }
}

export class RiScConflictError extends DomainError {
  readonly httpStatus = 409;
  readonly processingStatus = ProcessingStatus.ErrorWhenUpdatingRiSc;

  constructor(message = 'RiSc conflict detected') {
    super(message);
  }
}

export class GitHubFetchError extends DomainError {
  readonly httpStatus = 502;
  readonly processingStatus = ProcessingStatus.ErrorWhenUpdatingRiSc;

  constructor(message = 'GitHub fetch failed') {
    super(message);
  }
}

export class CreatePullRequestError extends DomainError {
  readonly httpStatus = 500;
  readonly processingStatus = ProcessingStatus.ErrorWhenCreatingPullRequest;

  constructor(message = 'Failed to create pull request') {
    super(message);
  }
}

export class SchemaFetchError extends DomainError {
  readonly httpStatus = 500;
  readonly processingStatus = ProcessingStatus.ErrorWhenUpdatingRiSc;

  constructor(message = 'Failed to fetch JSON schema') {
    super(message);
  }
}
