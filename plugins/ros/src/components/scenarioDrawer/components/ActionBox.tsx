import React from 'react';
import { Action } from '../../utils/types';
import { Grid, Typography } from '@material-ui/core';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useActionBoxStyles } from './actionBoxStyle';
import { formatDate } from '../../utils/utilityfunctions';
import Chip from '@material-ui/core/Chip';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../utils/style';

interface ActionBoxProps {
  action: Action;
  index: number;
}

export const ActionBox = ({ action, index }: ActionBoxProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { body2, label } = useFontStyles();
  const { gridContainer } = useScenarioDrawerStyles();
  const { alignCenter, justifyEnd } = useActionBoxStyles();

  return (
    <Grid container className={gridContainer}>
      <Grid item xs={12} className={alignCenter}>
        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>
        </Grid>

        <Grid item xs={6} className={justifyEnd}>
          <Chip
            label={action.status}
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
        <Typography className={body2}>{action.description}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>
          {t('dictionary.measureOwner')}
        </Typography>
        <Typography className={body2}>{action.owner}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>{t('dictionary.deadline')}</Typography>
        <Typography className={body2}>{formatDate(action.deadline)}</Typography>
      </Grid>
    </Grid>
  );
};
