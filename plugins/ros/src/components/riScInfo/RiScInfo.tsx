import React from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { Box, Grid, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import EditButton from '../common/EditButton';

interface RiScInfoProps {
  riSc: RiScWithMetadata;
  approveRiSc: () => void;
  edit: () => void;
}

export const RiScInfo = ({ riSc, approveRiSc, edit }: RiScInfoProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label, body2 } = useFontStyles();

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
        <InfoCard>
          <RiScStatusComponent
            selectedRiSc={riSc}
            publishRiScFn={approveRiSc}
          />
        </InfoCard>
      </Grid>
    </Grid>
  );
};
