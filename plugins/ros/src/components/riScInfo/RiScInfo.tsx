import React from 'react';
import { RiScWithMetadata } from '../utils/types';
import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { useFontStyles } from '../scenarioDrawer/style';
import { InfoCard } from '@backstage/core-components';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useRiScInfoStyles } from './riScInfoStyle';

interface RiScInfoProps {
  riSc: RiScWithMetadata;
  approveRiSc: () => void;
  edit: () => void;
}

export const RiScInfo = ({ riSc, approveRiSc, edit }: RiScInfoProps) => {
  const { label, body2 } = useFontStyles();
  const { infoCard } = useRiScInfoStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sm={6}
        md={8}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InfoCard className={infoCard}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5">{riSc.content.title}</Typography>
            <IconButton onClick={edit}>
              <EditIcon />
            </IconButton>
          </Box>
          <Typography className={label}>{t('dictionary.scope')}</Typography>
          <Typography className={body2}>{riSc.content.scope}</Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <RiScStatusComponent selectedRiSc={riSc} publishRiScFn={approveRiSc} />
      </Grid>
    </Grid>
  );
};
