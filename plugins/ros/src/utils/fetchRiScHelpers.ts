import { dtoToRiSc, RiScContentResultDTO, RiScDTO } from './DTOs';
import { ContentStatus, RiScWithMetadata } from './types';
import { pluginRiScMessages } from './translations.ts';

/**
 * Maps a RiScContentResultDTO to a RiScWithMetadata object.
 * Used when converting the raw API response to the internal representation.
 */
export function mapRiScDtoToRiScWithMetadata(
  dto: RiScContentResultDTO,
): RiScWithMetadata {
  const json = JSON.parse(dto.riScContent) as RiScDTO;
  const content = dtoToRiSc(json);
  return {
    id: dto.riScId,
    content,
    sopsConfig: dto.sopsConfig,
    status: dto.riScStatus,
    pullRequestUrl: dto.pullRequestUrl,
    migrationStatus: dto.migrationStatus,
    lastPublished: dto.lastPublished,
  };
}

/**
 * Appends a "login rejected" suffix to a status message when the request was
 * rejected due to login issues. This is a recurring pattern used across all
 * error callbacks from the authenticated fetch hooks.
 */
export function withLoginRejected(
  baseMessage: string,
  loginRejected: boolean,
  t: (key: any, options?: any) => string,
): string {
  return loginRejected
    ? `${baseMessage}. ${t('dictionary.rejectedLogin')}`
    : baseMessage;
}

type Paths<T> = {
  [K in Extract<keyof T, string>]: T[K] extends Record<string, any>
    ? `${K}.${Paths<T[K]>}`
    : K;
}[Extract<keyof T, string>];

/**
 * Maps a ContentStatus to a type-safe contentHeader translation key
 * for displaying a short reason in the RiSc selection dropdown.
 * Falls back to a generic unavailable key for statuses not explicitly mapped.
 */
export function getUnavailableRiScReasonKey(
  status: ContentStatus,
): Paths<Pick<typeof pluginRiScMessages, 'contentHeader'>> {
  switch (status) {
    case ContentStatus.FileNotFound:
      return 'contentHeader.unavailableReasonFileNotFound';
    case ContentStatus.NoReadAccess:
      return 'contentHeader.unavailableReasonNoReadAccess';
    case ContentStatus.SchemaValidationFailed:
      return 'contentHeader.unavailableReasonSchemaValidationFailed';
    case ContentStatus.Failure:
      return 'contentHeader.unavailableReasonFailure';
    case ContentStatus.Deleted:
      return 'contentHeader.unavailableReasonDeleted';
    case ContentStatus.UnsupportedMigration:
      return 'contentHeader.unavailableReasonUnsupportedMigration';
    default:
      return 'contentHeader.unavailableReasonUnknown';
  }
}
