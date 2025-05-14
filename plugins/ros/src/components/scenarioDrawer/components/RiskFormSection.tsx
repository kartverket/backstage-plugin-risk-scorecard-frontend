import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { UseFormReturn } from 'react-hook-form';
import {
  consequenceOptions,
  probabilityOptions,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import { Select } from '../../common/Select';
import { heading3 } from '../../common/typography';
import {
  headerSection,
  riscSection,
  section,
  selectSection,
} from '../scenarioDrawerComponents';

function ScenarioForm({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    control,
    formState: { errors },
  } = formMethods;

  const probabilityValues = probabilityOptions.map((value, index) => ({
    value: `${value}`,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: `${index + 1}: ${t(`probabilityTable.rows.${index + 1}`)}`,
  }));

  const consequenceValues = consequenceOptions.map((value, index) => ({
    value: `${value}`,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: `${index + 1}: ${t(`consequenceTable.rows.${index + 1}`)}`,
  }));

  return (
    <Paper sx={section}>
      <Box
        sx={{
          display: 'flex',
          gap: '24px',
        }}
      >
        <Paper sx={riscSection}>
          <Box sx={selectSection}>
            {/* Row 1 */}
            <Box sx={headerSection}>
              <Typography sx={{ ...heading3, justifySelf: 'start' }}>
                {t('dictionary.initialRisk')}
              </Typography>
              <Typography>
                {t('scenarioDrawer.riskMatrixModal.startRisk')}
              </Typography>
            </Box>
            <Box sx={headerSection}>
              <Typography sx={{ ...heading3, justifySelf: 'flex-start' }}>
                {t('dictionary.restRisk')}
              </Typography>
              <Typography>
                {t('scenarioDrawer.riskMatrixModal.restRisk')}
              </Typography>
            </Box>

            {/* Row 2 */}
            <Select<FormScenario>
              control={control}
              name="risk.probability"
              label={t('dictionary.probability')}
              options={probabilityValues}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.probability"
              label={t('dictionary.probability')}
              options={probabilityValues}
              rules={{
                validate: (value, _) =>
                  Number(value) <=
                    Number(control._formValues.risk?.probability) ||
                  t('scenarioDrawer.errors.remainingProbabilityTooHigh'),
              }}
              error={errors.remainingRisk?.probability !== undefined}
              helperText={errors.remainingRisk?.probability?.message}
            />

            {/* Row 3 */}
            <Select<FormScenario>
              control={control}
              name="risk.consequence"
              label={t('dictionary.consequence')}
              options={consequenceValues}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('dictionary.consequence')}
              options={consequenceValues}
              rules={{
                validate: (value, _) =>
                  Number(value) <=
                    Number(control._formValues.risk?.consequence) ||
                  t('scenarioDrawer.errors.remainingConsequenceTooHigh'),
              }}
              error={errors.remainingRisk?.consequence !== undefined}
              helperText={errors.remainingRisk?.consequence?.message}
            />
          </Box>
        </Paper>
      </Box>
      <IconButton
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
        }}
        onClick={() => setIsMatrixDialogOpen(true)}
        color="primary"
      >
        <InfoIcon />
      </IconButton>
    </Paper>
  );
}

export default ScenarioForm;
