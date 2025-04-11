import { pluginRiScTranslationRef } from '../../../utils/translations';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import {
  body2,
  emptyState,
  heading1,
  heading3,
  label,
} from '../../common/typography';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';

export function ScopeSection() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario } = useScenario();

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('scenarioDrawer.title')}</Typography>

      <Typography sx={heading1}>{scenario.title}</Typography>

      <Box>
        <Typography sx={label}>{t('dictionary.description')}</Typography>
        {scenario.description ? (
          <Typography className="markdown-body">
            <ReactMarkdown>{scenario.description}</ReactMarkdown>
          </Typography>
        ) : (
          <Typography sx={emptyState}>
            {t('dictionary.emptyField', {
              field: t('dictionary.description').toLowerCase(),
            })}
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography sx={label}>{t('dictionary.threatActors')}</Typography>
          {scenario.threatActors.length > 0 ? (
            scenario.threatActors.map(threatActor => {
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              const translatedThreatActor = t(`threatActors.${threatActor}`);
              return (
                <Typography key={threatActor} sx={body2}>
                  {translatedThreatActor}
                </Typography>
              );
            })
          ) : (
            <Typography sx={emptyState}>
              {t('dictionary.emptyField', {
                field: t('dictionary.threatActors').toLowerCase(),
              })}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography sx={label}>{t('dictionary.vulnerabilities')}</Typography>
          {scenario.vulnerabilities.length > 0 ? (
            scenario.vulnerabilities.map(vulnerability => {
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              const translatedVulnerability = t(
                `vulnerabilities.${vulnerability}`,
              );
              return (
                <Typography key={vulnerability} sx={body2}>
                  {translatedVulnerability}
                </Typography>
              );
            })
          ) : (
            <Typography sx={emptyState}>
              {t('dictionary.emptyField', {
                field: t('dictionary.vulnerabilities').toLowerCase(),
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
