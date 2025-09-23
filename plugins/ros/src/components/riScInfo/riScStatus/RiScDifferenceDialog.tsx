import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ErrorOutline, Favorite } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { DateTime } from 'luxon';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { DifferenceFetchState, DifferenceStatus } from '../../../utils/types';
import { parseISODateFromEncryptedROS } from '../../../utils/utilityfunctions';
import { RiScChangeSet } from '../changeset/RiScChangeSet.tsx';
import { Text, Box } from '@backstage/ui';

type RiScDifferenceDialogProps = {
  differenceFetchState: DifferenceFetchState;
};

export function RiScDifferenceDialog({
  differenceFetchState,
}: RiScDifferenceDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const formatedDateString = parseISODateFromEncryptedROS(
    differenceFetchState.defaultLastModifiedDateString,
  );

  const parsedDateString = formatedDateString
    ? DateTime.fromISO(formatedDateString).toLocaleString()
    : null;
  return (
    <Box style={{ paddingBottom: '24px' }}>
      <Text as="p" style={{ fontSize: '16px' }}>
        {t('rosStatus.difference.description')}
      </Text>
      <Text
        as="p"
        style={{ fontSize: '13px', fontWeight: 700, paddingBottom: '16px' }}
      >
        {parsedDateString &&
          t('rosStatus.difference.publishDate', {
            date: parsedDateString,
          })}
      </Text>
      <Box>
        <Text as="h3" style={{ fontWeight: 700, fontSize: '18px' }}>
          {t('rosStatus.difference.differences.title')}
        </Text>
        {differenceFetchState.isLoading && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: 'auto 0',
            }}
          >
            <CircularProgress
              size={30}
              sx={{ marginLeft: 1, color: 'inherit', margin: '10px' }}
            />
            {t('rosStatus.difference.fetching')}
          </Box>
        )}
        {differenceFetchState.status !== null &&
          differenceFetchState.status !== DifferenceStatus.Success &&
          differenceFetchState.status !==
            DifferenceStatus.GithubFileNotFound && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: 'auto 0',
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: '30px',
                  marginBottom: '16px',
                  color: 'red',
                }}
              />
              {t('rosStatus.difference.error')}
            </Box>
          )}
        {differenceFetchState.status !== null &&
          differenceFetchState.status ===
            DifferenceStatus.GithubFileNotFound && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: 'auto 0',
              }}
            >
              <Favorite
                sx={{
                  fontSize: '30px',
                  marginBottom: '16px',
                  color: 'green',
                }}
              />
              {t('rosStatus.difference.newROS')}
            </Box>
          )}
        {differenceFetchState.status === DifferenceStatus.Success && (
          <RiScChangeSet changeset={differenceFetchState} />
        )}
      </Box>
    </Box>
  );
}
