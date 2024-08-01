import { ActionBox } from './ActionBox';
import React, { Fragment } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { emptyState, heading3 } from '../../common/typography';
import Divider from '@mui/material/Divider';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario, saveScenario } = useScenario();

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('dictionary.measure')}</Typography>

      {scenario.actions.length > 0 ? (
        scenario.actions.map((action, index) => (
          <Fragment key={action.ID}>
            <Divider />
            <ActionBox
              action={action}
              index={index + 1}
              saveScenario={saveScenario}
            />
          </Fragment>
        ))
      ) : (
        <Typography sx={emptyState}>
          {t('dictionary.emptyField', {
            field: t('dictionary.measures').toLowerCase(),
          })}
        </Typography>
      )}
    </Paper>
  );
};
