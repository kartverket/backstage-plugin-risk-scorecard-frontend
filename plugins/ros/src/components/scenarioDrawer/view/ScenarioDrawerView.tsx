import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { useFontStyles, useInputFieldStyles, useScenarioDrawerContentStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import { CloseConfirmation } from '../edit/CloseConfirmation';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from '../edit/DeleteConfirmation';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import { TiltakView } from './TiltakView';
import { RiskView } from './RiskView';
import { ScenarioView } from './ScenarioView';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

export const ScenarioDrawerView = () => {
  const { buttons, titleAndButton, section } = useScenarioDrawerContentStyles();
  const { paper } = useInputFieldStyles();

  const { h3, button } = useFontStyles();

  const {
    scenario,
    saveScenario,
    openDeleteConfirmation,
    closeScenario,
    editScenario,
  } = useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const close = () => {
    closeScenario();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    if (saveScenario()) {
      close();
    }
  };

  return (
    <>
      <Box
        className={buttons}
        style={{
          marginBottom: '8px',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          className={button}
          variant="outlined"
          color="primary"
          onClick={closeScenario}
        >
          {t('dictionary.close')}
        </Button>
      </Box>

      <ScenarioView />
      <RiskView />

      {/* Tiltak */}
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
              startIcon={<BorderColorOutlinedIcon />}
            ></Button>
          </Grid>
          {scenario.actions.map((action, index) => (
            <>
              <TiltakView tiltak={action} index={index + 1} />
              {index !== (scenario.actions.length - 1) && <Divider variant="fullWidth" />}
            </>
          ))}
        </Paper>
      </Box>

      <Box
        className={buttons}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'flex-start',
        }}
      >
        <Button
          startIcon={<DeleteIcon />}
          variant="text"
          color="primary"
          onClick={openDeleteConfirmation}
        >
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </Box>

      <DeleteConfirmation />

      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={saveAndClose}
      />
    </>
  );
};
