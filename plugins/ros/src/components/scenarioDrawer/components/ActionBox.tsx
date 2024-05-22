import React, { useEffect, useState } from 'react';
import { Action } from '../../utils/types';
import { Grid, Typography } from '@material-ui/core';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useActionBoxStyles } from './actionBoxStyle';
import { formatDate } from '../../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../utils/style';
import { ChipDropdown } from '../../utils/ChipDropdown';
import { actionStatusOptions } from '../../utils/constants';

interface ActionBoxProps {
  action: Action;
  index: number;
  updateAction: (action: Action) => void;
  saveScenario: () => void;
}

export const ActionBox = ({
  action,
  index,
  updateAction,
  saveScenario,
}: ActionBoxProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { body2, label } = useFontStyles();
  const { gridContainer } = useScenarioDrawerStyles();
  const { alignCenter, justifyEnd } = useActionBoxStyles();
  const [previousAction, setPreviousAction] = useState(action);

  useEffect(() => {
    if (previousAction !== action) {
      saveScenario();
      setPreviousAction(action);
    }
  }, [action, saveScenario, previousAction]);

  const setStatus = (status: string) => {
    updateAction({
      ...action,
      status: status,
    });
  };

  return (
    <Grid container className={gridContainer}>
      <Grid item xs={12} className={alignCenter}>
        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>
        </Grid>

        <Grid item xs={6} className={justifyEnd}>
          <ChipDropdown
            options={actionStatusOptions}
            selectedValue={action.status}
            handleChange={setStatus}
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
