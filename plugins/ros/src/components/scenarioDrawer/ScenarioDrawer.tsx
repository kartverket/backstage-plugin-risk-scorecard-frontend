import React from 'react';
import { Button, Drawer } from '@material-ui/core';
import { useScenarioDrawerStyles } from './scenarioDrawerStyle';
import { useScenario } from '../../ScenarioContext';
import { ScenarioDrawerState } from '../../utils/hooks';
import { RiskSection } from './components/RiskSection';
import { ActionsSection } from './components/ActionsSection';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import { ScopeSection } from './components/ScopeSection';

export const ScenarioDrawer = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { drawer } = useScenarioDrawerStyles();
  const { button } = useFontStyles();

  const { scenarioDrawerState, openDeleteConfirmation, closeScenario } =
    useScenario();

  const isOpen = scenarioDrawerState !== ScenarioDrawerState.Closed;

  return (
    <Drawer
      classes={{ paper: drawer }}
      variant="temporary"
      anchor="right"
      open={isOpen}
      onClose={closeScenario}
    >
      <Button
        className={button}
        variant="outlined"
        color="primary"
        onClick={closeScenario}
        style={{ marginLeft: 'auto' }}
      >
        {t('dictionary.close')}
      </Button>

      <ScopeSection />
      <RiskSection />
      <ActionsSection />

      <Button
        startIcon={<DeleteIcon />}
        variant="text"
        color="primary"
        onClick={openDeleteConfirmation}
        style={{ marginRight: 'auto' }}
      >
        {t('scenarioDrawer.deleteScenarioButton')}
      </Button>

      <DeleteConfirmation />
    </Drawer>
  );
};
