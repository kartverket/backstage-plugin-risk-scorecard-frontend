import { pluginRiScTranslationRef } from '../../../utils/translations';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { Markdown } from '../../common/Markdown';
import { Text } from '@backstage/ui';

export function ScopeSection() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario } = useScenario();

  return (
    <Paper sx={section}>
      <Text variant="title-x-small" weight="bold">
        {t('scenarioDrawer.title')}
      </Text>

      <Text variant="title-medium" weight="bold">
        {scenario.title}
      </Text>

      <Box>
        <Text
          variant="body-medium"
          weight="bold"
          style={{ paddingBottom: '0.4rem' }}
        >
          {t('dictionary.description')}
        </Text>
        {scenario.description ? (
          <Markdown description={scenario.description} />
        ) : (
          <Text variant="body-large" style={{ fontStyle: 'italic' }}>
            {t('dictionary.emptyField', {
              field: t('dictionary.description').toLowerCase(),
            })}{' '}
          </Text>
        )}
      </Box>

      <Divider />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Text as="p" variant="body-medium" weight="bold">
            {t('dictionary.threatActors')}
          </Text>
          {scenario.threatActors.length > 0 ? (
            scenario.threatActors.map(threatActor => {
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              const translatedThreatActor = t(`threatActors.${threatActor}`);
              return (
                <Text as="p" variant="body-large" key={threatActor}>
                  {translatedThreatActor}
                </Text>
              );
            })
          ) : (
            <Text variant="body-large" style={{ fontStyle: 'italic' }}>
              {t('dictionary.emptyField', {
                field: t('dictionary.threatActors').toLowerCase(),
              })}
            </Text>
          )}
        </Box>

        <Box>
          <Text as="p" variant="body-medium" weight="bold">
            {t('dictionary.vulnerabilities')}
          </Text>
          {scenario.vulnerabilities.length > 0 ? (
            scenario.vulnerabilities.map(vulnerability => {
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              const translatedVulnerability = t(
                `vulnerabilities.${vulnerability}`,
              );
              return (
                <Text variant="body-large" as="p" key={vulnerability}>
                  {translatedVulnerability}
                </Text>
              );
            })
          ) : (
            <Text variant="body-large" style={{ fontStyle: 'italic' }}>
              {t('dictionary.emptyField', {
                field: t('dictionary.vulnerabilities').toLowerCase(),
              })}
            </Text>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
