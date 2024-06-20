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
  const {
    alignCenter,
    row,
    paddingTop,
    actionDescription,
    column,
    chipDropdown,
  } = useActionBoxStyles();
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
        <Grid item xs={6} className={paddingTop}>
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>
        </Grid>
      </Grid>

      <Grid item xs={12} className={actionDescription}>
        <Typography className={body2}>{action.description}</Typography>
      </Grid>

      <Grid container xs={12} className={row}>
        <Grid item xs={4}>
          <Typography className={label}>
            {t('dictionary.measureOwner')}
          </Typography>
          <Typography className={body2}>{action.owner}</Typography>
        </Grid>

        <Grid container xs={4} className={column}>
          <Typography className={label}>{t('dictionary.deadline')}</Typography>
          <Typography className={body2}>
            {formatDate(action.deadline)}
          </Typography>
        </Grid>

        <Grid item xs={3} className={chipDropdown}>
          <ChipDropdown
            options={actionStatusOptions}
            selectedValue={action.status}
            handleChange={setStatus}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
