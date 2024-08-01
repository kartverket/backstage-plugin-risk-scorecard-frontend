import React from 'react';
import { RiSc, RiScWithMetadata } from '../../utils/types';
import { Box, Grid, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import EditButton from '../common/EditButton';
import { useRiScs } from '../../contexts/RiScContext';

interface RiScInfoProps {
  riSc: RiScWithMetadata;
  edit: () => void;
  updateRiSc: (selectedRiSc: RiSc) => void;
}

export const RiScInfo = ({ riSc, edit, updateRiSc }: RiScInfoProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label, body2 } = useFontStyles();

  const { approveRiSc } = useRiScs();

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
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
      <Grid item xs={12} sm={6} md={6}>
        <RiScStatusComponent
          selectedRiSc={riSc}
          publishRiScFn={approveRiSc}
          updateRiSc={updateRiSc}
        />
      </Grid>
    </Grid>
  );
};
