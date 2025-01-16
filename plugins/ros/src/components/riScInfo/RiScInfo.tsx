import React, { useState } from 'react';
import { DifferenceFetchState, RiScWithMetadata } from '../../utils/types';
import { Box, Grid, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import EditButton from '../common/EditButton';
import { useRiScs } from '../../contexts/RiScContext';
import { LastPublishedComponent } from './riScStatus/LastPublishedComponent';

interface RiScInfoProps {
  riSc: RiScWithMetadata;
  edit: () => void;
}

const emptyDifferenceFetchState: DifferenceFetchState = {
  differenceState: {
    entriesOnLeft: [],
    entriesOnRight: [],
    difference: [],
  },
  status: null,
  isLoading: false,
  errorMessage: '',
  currentDifferenceId: '',
  defaultLastModifiedDateString: '',
};

export const RiScInfo = ({ riSc, edit }: RiScInfoProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label, body2 } = useFontStyles();

  const { approveRiSc } = useRiScs();

  const [differenceFetchState, setDifferenceFetchState] =
    useState<DifferenceFetchState>(emptyDifferenceFetchState);

  return (
    <Grid container>
      <Grid
        item
        xs={8}
        sm={4}
        md={4}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InfoCard>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5">{riSc.content.title}</Typography>
            <EditButton onClick={edit} />
          </Box>
          <Typography className={label}>{t('dictionary.scope')}</Typography>
          <Typography className={body2}>{riSc.content.scope}</Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={8} sm={4} md={4}>
        <RiScStatusComponent
          selectedRiSc={riSc}
          publishRiScFn={approveRiSc}
          differenceFetchState={differenceFetchState}
          setDifferenceFetchState={setDifferenceFetchState}
          emptyDifferenceFetchState={emptyDifferenceFetchState}
        />
      </Grid>
      <Grid item xs={8} sm={4} md={4}>
        <LastPublishedComponent
          selectedRiSc={riSc}
          differenceFetchState={differenceFetchState}
          setDifferenceFetchState={setDifferenceFetchState}
          emptyDifferenceFetchState={emptyDifferenceFetchState}
        />
      </Grid>
    </Grid>
  );
};
