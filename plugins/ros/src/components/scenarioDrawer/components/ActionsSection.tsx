import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';
import { ActionBox } from './ActionBox';
import Box from '@mui/material/Box';
import React, { useContext } from 'react';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useFontStyles } from '../../utils/style';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

export const ActionsSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h3, button } = useFontStyles();
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
          <Typography className={h3} gutterBottom>
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
        {scenario.actions.map((action, index) => (
          <>
            <ActionBox
              action={action}
              index={index + 1}
              updateAction={updateAction}
              saveScenario={saveScenario}
            />
            {index !== scenario.actions.length - 1 && (
              <Divider variant="fullWidth" />
            )}
          </>
        ))}
      </Paper>
    </Box>
  );
};
