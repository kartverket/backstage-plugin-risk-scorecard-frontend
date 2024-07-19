import { ActionBox } from './ActionBox';
import React, { Fragment } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useScenario } from '../../../ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import Box from '@mui/material/Box';
import { body2, heading3, label } from '../../common/typography';
import Divider from '@mui/material/Divider';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario, saveScenario } = useScenario();

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>
        {t('scenarioDrawer.measureTab.title')}
      </Typography>
      {scenario.existingActions && (
        <Box>
          <Typography sx={label}>
            {t('scenarioDrawer.measureTab.existingMeasure')}
          </Typography>
          <Typography sx={body2}>{scenario.existingActions}</Typography>
        </Box>
      )}

      {scenario.actions.map((action, index) => (
        <Fragment key={action.ID}>
          <Divider />
          <ActionBox
            action={action}
            index={index + 1}
            saveScenario={saveScenario}
          />
        </Fragment>
      ))}
    </Paper>
  );
};
