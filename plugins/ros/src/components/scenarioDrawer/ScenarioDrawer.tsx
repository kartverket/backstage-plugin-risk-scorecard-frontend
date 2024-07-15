import React, { useEffect, useState } from 'react';
import { Box, Button, Drawer } from '@material-ui/core';
import { useScenarioDrawerStyles } from './scenarioDrawerStyle';
import { useScenario } from '../../ScenarioContext';
import { RiskSection } from './components/RiskSection';
import { ActionsSection } from './components/ActionsSection';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { ScopeSection } from './components/ScopeSection';
import { useForm } from 'react-hook-form';
import ScenarioForm from './components/ScenarioForm';
import { Scenario } from '../../utils/types';

export const ScenarioDrawer = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { drawer, buttons } = useScenarioDrawerStyles();
  const [isEditing, setIsEditing] = useState(false);

  const { scenario, isDrawerOpen, openDeleteConfirmation, closeScenario } =
    useScenario();

  const handleClose = () => {
    closeScenario();
    setIsEditing(false);
  };

  const formMethods = useForm<Scenario>({ defaultValues: scenario });

  useEffect(() => {
    formMethods.reset(scenario);
  }, [scenario, formMethods]);

  return (
    <Drawer
      classes={{ paper: drawer }}
      variant="temporary"
      anchor="right"
      open={isDrawerOpen}
      onClose={handleClose}
    >
      <Box className={buttons}>
        {!isEditing ? (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setIsEditing(true)}
            style={{ marginLeft: 'auto' }}
          >
            {t('dictionary.edit')}
          </Button>
        ) : (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setIsEditing(false)}
            style={{ marginLeft: 'auto' }}
          >
            {t('dictionary.save')}
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClose}
          style={{ marginLeft: 'auto' }}
        >
          {t('dictionary.close')}
        </Button>
      </Box>

      {isEditing ? (
        <ScenarioForm formMethods={formMethods} />
      ) : (
        <>
          <ScopeSection />
          <RiskSection />
          <ActionsSection />
        </>
      )}

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
