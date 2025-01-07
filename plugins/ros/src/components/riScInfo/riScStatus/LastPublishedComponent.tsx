import { parseISO } from 'date-fns';
import {
  getAgeStatus,
  parseISODateFromEncryptedROS,
} from '../../../utils/utilityfunctions';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useAuthenticatedFetch } from '../../../utils/hooks';
import { DifferenceFetchState, RiScWithMetadata } from '../../../utils/types';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { InfoCard } from '@backstage/core-components';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface LastPublishedComponentProps {
  selectedRiSc: RiScWithMetadata;
  differenceFetchState: DifferenceFetchState;
  setDifferenceFetchState: React.Dispatch<
    React.SetStateAction<DifferenceFetchState>
  >;
  emptyDifferenceFetchState: DifferenceFetchState;
}

export const LastPublishedComponent = ({
  selectedRiSc,
  differenceFetchState,
  setDifferenceFetchState,
  emptyDifferenceFetchState,
}: LastPublishedComponentProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { fetchDifference } = useAuthenticatedFetch();

  const getDifferences = () => {
    if (
      !selectedRiSc ||
      differenceFetchState.isLoading ||
      differenceFetchState.currentDifferenceId === selectedRiSc.id
    )
      return;

    setDifferenceFetchState({ ...differenceFetchState, isLoading: true });
    fetchDifference(
      selectedRiSc,
      response => {
        setDifferenceFetchState({
          differenceState: response.differenceState,
          isLoading: false,
          currentDifferenceId: selectedRiSc.id,
          status: response.status,
          errorMessage: response.errorMessage,
          defaultLastModifiedDateString: response.defaultLastModifiedDateString,
        });
      },
      () => {
        setDifferenceFetchState({
          ...emptyDifferenceFetchState,
          errorMessage: t('rosStatus.difference.error'),
          status: 'FrontendFallback', // Fallback when the backend does not deliver a response with status
        });
      },
    );
  };

  const formatedDateString = parseISODateFromEncryptedROS(
    differenceFetchState.defaultLastModifiedDateString,
  );

  const lastModifiedDate =
    formatedDateString && parseISO(formatedDateString).toLocaleDateString();

  getDifferences(); // TODO

  const age = lastModifiedDate && getAgeStatus(lastModifiedDate);

  return (
    <InfoCard>
      <Typography variant="h5">Publication status</Typography>
      {!lastModifiedDate && (
        <Typography display="flex" gap={1} mt={1}>
          <HighlightOffIcon color="error" />
          No risk scorecard published
        </Typography>
      )}
      {lastModifiedDate && (
        <Typography display="flex" flexDirection="column" gap={1} mt={1}>
          <Box display="flex" gap={1}>
            <CheckCircleOutlineIcon color="success" />
            Risk scorecard published
          </Box>
          <Box display="flex" gap={1}>
            {age === 'bad' && <SentimentVeryDissatisfiedIcon color="error" />}
            {age === 'ok' && <SentimentNeutralIcon color="warning" />}
            {age === 'good' && <SentimentSatisfiedAltIcon color="success" />}
            {t('rosStatus.difference.publishDate')}
            {lastModifiedDate}
          </Box>
        </Typography>
      )}
    </InfoCard>
  );
};
