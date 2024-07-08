import React, { useEffect, useState } from 'react';
import { Action } from '../../../utils/types';
import { Grid, Link, Typography } from '@material-ui/core';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useActionBoxStyles } from './actionBoxStyle';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useFontStyles } from '../../../utils/style';
import { ChipDropdown } from '../../common/ChipDropdown';
import { actionStatusOptions } from '../../../utils/constants';

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
  const { alignCenter, row, paddingTop, actionDescription, chipDropdown } =
    useActionBoxStyles();
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

      <Grid item xs={12} className={row}>
        <Grid item xs={8}>
          <Typography className={label}>{t('dictionary.url')}</Typography>
          {action.url ? (
            <Link
              className={body2}
              target="_blank"
              rel="noreferrer"
              href={
                action.url.startsWith('http') ? action.url : `//${action.url}`
              }
            >
              {action.url}
            </Link>
          ) : (
            <Typography className={body2}>
              {t('dictionary.emptyUrl')}
            </Typography>
          )}
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
