import { dtoToRiSc, RiScContentResultDTO, RiScDTO } from './DTOs';
import { ContentStatus, RiScWithMetadata } from './types';

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

/**
 * Maps a ContentStatus to a translation key for displaying a short reason
 * in the RiSc selection dropdown. Falls back to a generic unavailable key
 * for statuses not explicitly mapped.
 */
export function getUnavailableRiScReasonKey(status: ContentStatus): string {
  const keyMap: Partial<Record<ContentStatus, string>> = {
    [ContentStatus.FileNotFound]: 'contentHeader.unavailableReasonFileNotFound',
    [ContentStatus.NoReadAccess]: 'contentHeader.unavailableReasonNoReadAccess',
    [ContentStatus.SchemaValidationFailed]:
      'contentHeader.unavailableReasonSchemaValidationFailed',
    [ContentStatus.Failure]: 'contentHeader.unavailableReasonFailure',
    [ContentStatus.Deleted]: 'contentHeader.unavailableReasonDeleted',
    [ContentStatus.UnsupportedMigration]:
      'contentHeader.unavailableReasonUnsupportedMigration',
  };
  return keyMap[status] ?? 'contentHeader.unavailableReasonUnknown';
}
