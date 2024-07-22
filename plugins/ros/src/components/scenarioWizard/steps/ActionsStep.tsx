import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import Box from '@material-ui/core/Box';
import { Button, Typography } from '@material-ui/core';
import Grid from '@mui/material/Grid';
import { TextField } from '../../common/Textfield';
import AddCircle from '@material-ui/icons/AddCircle';
import { useFontStyles } from '../../../utils/style';
import { ActionEdit } from '../components/ActionEdit';
import { useScenario } from '../../../ScenarioContext';

export const ActionsStep = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h2, subtitle2, actionSubtitle } = useFontStyles();
  const { scenario, setScenarioValue, updateAction, deleteAction, addAction } =
    useScenario();

  return (
    <Box>
      <Typography className={h2}>{t('dictionary.measure')}</Typography>
      <Typography className={subtitle2}>
        {t('scenarioDrawer.measureTab.subtitle')}
      </Typography>
      <Grid item xs={12} style={{ paddingTop: '1.5rem' }}>
        <TextField
          label={t('scenarioDrawer.measureTab.existingMeasure')}
          subtitle={t('scenarioDrawer.measureTab.existingMeasureSubtitle')}
          value={scenario.existingActions}
          handleChange={value => setScenarioValue('existingActions', value)}
          minRows={3}
        />
      </Grid>
      <Typography variant="h6" className={actionSubtitle}>
        {t('scenarioDrawer.measureTab.plannedMeasures')}
      </Typography>
      {scenario.actions.map((action, index) => (
        <ActionEdit
          key={action.ID}
          action={action}
          index={index + 1}
          updateAction={updateAction}
          deleteAction={deleteAction}
        />
      ))}

      <Button startIcon={<AddCircle />} color="primary" onClick={addAction}>
        {t('scenarioDrawer.measureTab.addMeasureButton')}
      </Button>
    </Box>
  );
};
