import React from 'react';
import { DifferenceFetchState } from '../../../utils/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { ErrorOutline, Favorite } from '@mui/icons-material';
import { DifferenceText } from './DifferenceText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';

type RiScDifferenceDialogProps = {
  differenceFetchState: DifferenceFetchState;
};

export const RiScDifferenceDialog = ({
  differenceFetchState,
}: RiScDifferenceDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box>
      <Typography pb={2}>{t('rosStatus.difference.description')}</Typography>
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
            differenceFetchState.status !== 'Success' &&
            differenceFetchState.status !== 'GithubFileNotFound' && (
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
            differenceFetchState.status === 'GithubFileNotFound' && (
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
          {differenceFetchState.status === 'Success' && (
            <DifferenceText differenceFetchState={differenceFetchState} />
          )}
        </Card>
      </Box>
    </Box>
  );
};
