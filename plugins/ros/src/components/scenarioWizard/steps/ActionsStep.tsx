import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddCircle from '@mui/icons-material/AddCircle';
import { ActionEdit } from '../components/ActionEdit';
import { useScenario } from '../../../contexts/ScenarioContext';
import { heading2, heading3, subtitle2 } from '../../common/typography';
import Box from '@mui/material/Box';

export const ActionsStep = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario, updateAction, deleteAction, addAction } = useScenario();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={heading2}>{t('dictionary.measure')}</Typography>
        <Typography sx={subtitle2}>
          {t('scenarioDrawer.measureTab.subtitle')}
        </Typography>
      </Box>
      <Stack spacing={1}>
        <Typography sx={heading3}>
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
        <Button
          startIcon={<AddCircle />}
          onClick={addAction}
          sx={{ width: 'fit-content' }}
        >
          {t('scenarioDrawer.measureTab.addMeasureButton')}
        </Button>
      </Stack>
    </Stack>
  );
};
