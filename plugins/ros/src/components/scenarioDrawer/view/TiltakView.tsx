import React from 'react';
import { Action as ITiltak } from '../../utils/types';
import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
import { useTiltakViewStyles } from './style';
import { formatDate } from '../../utils/utilityfunctions';
import Chip from '@material-ui/core/Chip';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface TiltakProps {
  tiltak: ITiltak;
  index: number;
}

export const TiltakView = ({ tiltak, index }: TiltakProps) => {
  const { section } = useScenarioDrawerContentStyles();
  const { alignCenter, justifyEnd } = useTiltakViewStyles();
  const { body2, label } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (

    <Grid container className={section}>
      <Grid item xs={12} className={alignCenter} >
        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>
        </Grid>

        <Grid item xs={6} className={justifyEnd}>
          <Chip
            label={tiltak.status}
            size="small"
            style={{
              margin: 0,
              padding: 0,
              backgroundColor: '#D9D9D9',
              color: '#000000',
            }}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography className={body2}>{tiltak.description}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>
          {t('dictionary.measureOwner')}
        </Typography>
        <Typography className={body2}>{tiltak.owner}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>{t('dictionary.deadline')}</Typography>
        <Typography className={body2}>
          {formatDate(tiltak.deadline)}
        </Typography>
      </Grid>
    </Grid>
  );
};
