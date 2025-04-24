import { DifferenceFetchState, DifferenceStatus } from '../../../utils/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { ErrorOutline, Favorite } from '@mui/icons-material';
import { DifferenceText } from './DifferenceText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { parseISODateFromEncryptedROS } from '../../../utils/utilityfunctions';
import { parseISO } from 'date-fns';

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
    ? parseISO(formatedDateString).toLocaleDateString()
    : null;
  return (
    <Box>
      <Typography>{t('rosStatus.difference.description')}</Typography>
      <Typography fontWeight={700} fontSize={13} pb={2}>
        {parsedDateString &&
          t('rosStatus.difference.publishDate', {
            date: parsedDateString,
          })}
      </Typography>
      <Box>
        <Typography variant="h3" fontSize={18}>
          {t('rosStatus.difference.differences.title')}
        </Typography>
        <Card
          sx={{
            backgroundColor: 'rgb(51, 51, 51)',
            padding: '20px',
            position: 'relative',
            marginBottom: '20px',
            minHeight: '260px',
            color: 'white',
          }}
        >
          {differenceFetchState.isLoading && (
            <Box
              sx={{
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
                sx={{
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
                sx={{
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
            <DifferenceText differenceFetchState={differenceFetchState} />
          )}
        </Card>
      </Box>
    </Box>
  );
}
