import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { body2, heading1, heading3, label } from '../../common/typography';

export const ScopeSection = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario } = useScenario();

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('scenarioDrawer.title')}</Typography>

      <Typography sx={heading1}>{scenario.title}</Typography>

      <Box>
        <Typography sx={label}>{t('dictionary.description')}</Typography>
        <Typography sx={body2}>{scenario.description}</Typography>
      </Box>

      <Divider />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography sx={label}>{t('dictionary.threatActors')}</Typography>
          {scenario.threatActors.map(threatActor => (
            <Typography key={threatActor} sx={body2}>
              {threatActor}
            </Typography>
          ))}
        </Box>

        <Box>
          <Typography sx={label}>{t('dictionary.vulnerabilities')}</Typography>
          {scenario.vulnerabilities.map(vulnerability => (
            <Typography key={vulnerability} sx={body2}>
              {vulnerability}
            </Typography>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
