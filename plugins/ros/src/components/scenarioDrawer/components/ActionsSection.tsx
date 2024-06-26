import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { ActionBox } from './ActionBox';
import Box from '@mui/material/Box';
import React, { Fragment, useContext } from 'react';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useFontStyles } from '../../utils/style';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { ExistingActionBox } from './ExistingActionBox';
import EditButton from '../../utils/EditButton';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h3, label } = useFontStyles();
  const { titleAndButton, section } = useScenarioDrawerStyles();
  const { scenario, editScenario, saveScenario, updateAction } =
    useContext(ScenarioContext)!!;

  return (
    <Box>
      <Paper className={section} style={{ padding: '1rem' }}>
        <Grid
          item
          xs={12}
          className={titleAndButton}
          style={{
            marginBottom: '12px',
          }}
        >
          <Typography className={h3}>
            {t('scenarioDrawer.measureTab.actionsTitle')}
          </Typography>
          <EditButton onClick={() => editScenario('measure')} />
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
