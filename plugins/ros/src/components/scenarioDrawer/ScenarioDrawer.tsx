import React, { useContext } from 'react';
import { Button, Drawer } from '@material-ui/core';
import { useScenarioDrawerStyles } from './scenarioDrawerStyle';
import { ScenarioContext } from '../riScPlugin/ScenarioContext';
import { ScenarioDrawerState } from '../utils/hooks';
import Box from '@mui/material/Box';
import { RiskSection } from './components/RiskSection';
import { ActionsSection } from './components/ActionsSection';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useFontStyles } from '../utils/style';
import { ScopeSection } from './components/ScopeSection';

export const ScenarioDrawer = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { root, buttons } = useScenarioDrawerStyles();
  const { button } = useFontStyles();
  const { scenarioDrawerState, openDeleteConfirmation, closeScenario } =
    useContext(ScenarioContext)!!;

  const isOpen = scenarioDrawerState !== ScenarioDrawerState.Closed;

  return (
    <Drawer
      classes={{ paper: root }}
      variant="temporary"
      anchor="right"
      open={isOpen}
      onClose={closeScenario}
    >
      <Box
        className={buttons}
        style={{
          marginBottom: '8px',
          marginTop: '8px',
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

      <ScopeSection />
      <RiskSection />
      <ActionsSection />

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
    </Drawer>
  );
};
