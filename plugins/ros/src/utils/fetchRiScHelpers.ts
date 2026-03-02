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
 * Builds readable error message string from a list of RiScs that
 * failed to load. Groups them by ContentStatus and produces one line per
 * group, with special handling for DecryptionFailed entries that carry an
 * errorCode.
 */
export function buildFetchRiScErrorMessages(
  errorRiScs: RiScContentResultDTO[],
  t: (key: any, options?: any) => string,
): string {
  const errorsByStatus = errorRiScs.reduce(
    (acc, risk) => {
      if (!acc[risk.status]) {
        acc[risk.status] = [];
      }
      acc[risk.status].push(risk.riScId);
      return acc;
    },
    {} as Record<ContentStatus, string[]>,
  );

  return Object.entries(errorsByStatus)
    .map(([status, riScIds]) => {
      // Fallback to Failure for unknown status values
      const validStatuses = Object.values(ContentStatus);
      const statusKey = validStatuses.includes(status as ContentStatus)
        ? status
        : ContentStatus.Failure;

      if (statusKey === ContentStatus.DecryptionFailed) {
        const decryptionRisks = errorRiScs.filter(
          risk =>
            risk.status === ContentStatus.DecryptionFailed &&
            riScIds.includes(risk.riScId),
        );

        const withErrorCode = decryptionRisks.filter(risk => risk.errorCode);
        const withoutErrorCode = decryptionRisks.filter(
          risk => !risk.errorCode,
        );

        const messages: string[] = [];

        if (withErrorCode.length > 0) {
          const decryptionErrorsByMessage = withErrorCode.reduce(
            (acc, risk) => {
              const message = risk.errorCode!;
              if (!acc[message]) acc[message] = [];
              acc[message].push(risk.riScId);
              return acc;
            },
            {} as Record<string, string[]>,
          );

          Object.entries(decryptionErrorsByMessage).forEach(
            ([message, ids]) => {
              const errorKey = `errorMessages.ContentStatusDecryptionFailedMessage.${message}`;
              messages.push(
                t(errorKey as any, { riScId: ids.join(', '), status }),
              );
            },
          );
        }

        if (withoutErrorCode.length > 0) {
          const errorKey = `errorMessages.ContentStatus${statusKey}`;
          messages.push(
            t(errorKey as any, {
              riScId: withoutErrorCode.map(r => r.riScId).join(', '),
              status,
            }),
          );
        }

        return messages.join('\n');
      }

      const errorKey = `errorMessages.ContentStatus${statusKey}`;
      return t(errorKey as any, {
        riScId: (riScIds as string[]).join(', '),
        status,
      });
    })
    .join('\n');
}
