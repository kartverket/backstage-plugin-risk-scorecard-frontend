import { TextField } from '../../common/Textfield';
import { Dropdown } from '../../common/Dropdown';
import {
  threatActorsOptions,
  vulnerabilitiesOptions,
} from '../../../utils/constants';
import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../contexts/ScenarioContext';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formHelperText,
  formLabel,
  heading2,
  subtitle2,
} from '../../common/typography';

export const ScenarioStep = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario, setScenarioValue } = useScenario();

  const translatedThreatActors = threatActorsOptions.map(threatActor => {
    return {
      value: threatActor,
      /* @ts-ignore Because ts can't typecheck strings agains our keys */
      renderedValue: t(`threatActors.${threatActor}`),
    };
  });
  const translatedVulnerabilities = vulnerabilitiesOptions.map(
    vulnerability => {
      return {
        value: vulnerability,
        /* @ts-ignore Because ts can't typecheck strings agains our keys */
        renderedValue: t(`vulnerabilities.${vulnerability}`),
      };
    },
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={heading2}>{t('scenarioDrawer.title')}</Typography>
        <Typography sx={subtitle2}>{t('scenarioDrawer.subtitle')}</Typography>
      </Box>

      <TextField
        label={t('dictionary.title')}
        value={scenario.title}
        errorMessage={t('scenarioDrawer.titleError')}
        errorKey="scenario-title"
        required
        minRows={1}
        handleChange={value => setScenarioValue('title', value)}
      />

      <Stack direction="row" spacing={2}>
        <Stack sx={{ width: '100%' }}>
          <Typography sx={formLabel}>{t('dictionary.threatActors')}</Typography>
          <Typography sx={formHelperText}>
            {t('scenarioDrawer.threatActorSubtitle')}
          </Typography>
          <Dropdown<string[]>
            selectedValues={scenario.threatActors}
            options={translatedThreatActors}
            handleChange={value => setScenarioValue('threatActors', value)}
            renderSelectedValue={value => {
              /* @ts-ignore */
              return t(`threatActors.${value}`);
            }}
          />
        </Stack>

        <Stack sx={{ width: '100%' }}>
          <Typography sx={formLabel}>
            {t('dictionary.vulnerabilities')}
          </Typography>
          <Typography sx={formHelperText}>
            {t('scenarioDrawer.vulnerabilitySubtitle')}
          </Typography>
          <Dropdown<string[]>
            selectedValues={scenario.vulnerabilities}
            options={translatedVulnerabilities}
            handleChange={value => setScenarioValue('vulnerabilities', value)}
            renderSelectedValue={value => {
              /* @ts-ignore */
              return t(`vulnerabilities.${value}`);
            }}
          />
        </Stack>
      </Stack>

      <TextField
        label={t('dictionary.description')}
        value={scenario.description}
        minRows={4}
        handleChange={value => setScenarioValue('description', value)}
      />
    </Stack>
  );
};
