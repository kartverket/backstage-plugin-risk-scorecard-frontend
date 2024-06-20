import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';
import { ActionBox } from './ActionBox';
import Box from '@mui/material/Box';
import React, { Fragment, useContext } from 'react';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useFontStyles } from '../../utils/style';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { ExistingActionBox } from './ExistingActionBox';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h3, button, label } = useFontStyles();
  const { titleAndButton, section, editIcon } = useScenarioDrawerStyles();
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
          <Button
            className={button}
            variant="text"
            color="primary"
            onClick={() => editScenario('measure')}
            startIcon={<EditIcon className={editIcon} aria-label="Edit" />}
          />
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
