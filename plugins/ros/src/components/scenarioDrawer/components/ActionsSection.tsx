import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { ActionBox } from './ActionBox';
import Box from '@mui/material/Box';
import React, { Fragment } from 'react';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useFontStyles } from '../../../utils/style';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { ExistingActionBox } from './ExistingActionBox';
import { useScenario } from '../../../ScenarioContext';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h3, label } = useFontStyles();
  const { section } = useScenarioDrawerStyles();
  const { scenario, saveScenario, updateAction } = useScenario();

  return (
    <Box>
      <Paper className={section} style={{ padding: '1rem' }}>
        <Grid
          item
          xs={12}
          style={{
            marginBottom: '12px',
          }}
        >
          <Typography className={h3}>
            {t('scenarioDrawer.measureTab.actionsTitle')}
          </Typography>
        </Grid>
        {scenario.existingActions && (
          <>
            <Typography className={label}>
              {t('scenarioDrawer.measureTab.existingMeasure')}
            </Typography>
            <ExistingActionBox existingAction={scenario.existingActions} />
            {scenario.actions.length > 0 && <Divider variant="fullWidth" />}
          </>
        )}

        {scenario.actions.map((action, index) => (
          <Fragment key={action.ID}>
            <ActionBox
              action={action}
              index={index + 1}
              updateAction={updateAction}
              saveScenario={saveScenario}
            />
            {index !== scenario.actions.length - 1 && (
              <Divider variant="fullWidth" />
            )}
          </Fragment>
        ))}
      </Paper>
    </Box>
  );
};
