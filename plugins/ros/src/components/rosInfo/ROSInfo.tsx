import React from 'react';
import { ROSWithMetadata } from '../utils/types';
import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { ROSStatusComponent } from './rosStatus/ROSStatusComponent';
import { useFontStyles } from '../scenarioDrawer/style';
import { InfoCard } from '@backstage/core-components';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginTranslationRef } from '../utils/translations';

interface RosInfoProps {
  ros: ROSWithMetadata;
  approveROS: () => void;
  edit: () => void;
}

export const ROSInfo = ({ ros, approveROS, edit }: RosInfoProps) => {
  const { h2, subtitle1, body2 } = useFontStyles();

  const { t } = useTranslationRef(pluginTranslationRef);

  return (
    <Grid container>
      <Grid item xs={12} style={{ display: 'flex' }}>
        <Typography className={h2}>{ros.content.tittel}</Typography>
        <IconButton onClick={edit}>
          <BorderColorOutlinedIcon />
        </IconButton>
      </Grid>
      <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column' }}>
        <InfoCard>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
            }}
          >
            <Typography className={subtitle1}>
              {t('dictionary.scope')}
            </Typography>
            <IconButton onClick={edit} style={{ padding: 0 }}>
              <BorderColorOutlinedIcon />
            </IconButton>
          </Box>
          <Typography className={body2}>{ros.content.omfang}</Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={6}>
        <ROSStatusComponent selectedROS={ros} publishRosFn={approveROS} />
      </Grid>
    </Grid>
  );
};
