import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { UseFormReturn } from 'react-hook-form';
import {
  consequenceOptions,
  probabilityOptions,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import {
  consequenceIndexToTranslationKeys,
  findConsequenceIndex,
  findProbabilityIndex,
  probabilityIndexToTranslationKeys,
} from '../../../utils/utilityfunctions';
import { Select } from '../../common/Select';
import {
  headerSection,
  riscSection,
  section,
  selectSection,
} from '../scenarioDrawerComponents';
import RiskOptionDisplay from './RiskOptionDisplay';
import { Text } from '@backstage/ui';

function ScenarioForm({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    watch,
    control,
    formState: { errors },
  } = formMethods;

  const [
    riskProbability,
    riskConsequence,
    remainingRiskProbability,
    remainingRiskConsequence,
  ] = watch([
    'risk.probability',
    'risk.consequence',
    'remainingRisk.probability',
    'remainingRisk.consequence',
  ]);

  const probabilityValues = (selectedValue: number) => {
    return probabilityOptions.map((value, index) => ({
      value: `${value}`,
      renderedValue: (
        <RiskOptionDisplay
          isSelected={
            findProbabilityIndex(value) === findProbabilityIndex(selectedValue)
          }
          level={index + 1}
          label={
            /* @ts-ignore Because ts can't typecheck strings against our keys */
            `${t(`probabilityTable.rows.${index + 1}`)} (${t(
              probabilityIndexToTranslationKeys[index],
            )})`
          }
        />
      ),
    }));
  };

  const consequenceValues = (selectedValue: number) => {
    return consequenceOptions.map((value, index) => ({
      value: `${value}`,
      renderedValue: (
        <RiskOptionDisplay
          isSelected={
            findConsequenceIndex(value) === findConsequenceIndex(selectedValue)
          }
          level={index + 1}
          label={
            /* @ts-ignore Because ts can't typecheck strings against our keys */
            `${t(`consequenceTable.rows.${index + 1}`)} (${t(
              consequenceIndexToTranslationKeys[index],
            )})`
          }
        />
      ),
    }));
  };

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
              <Text variant="title-x-small" weight="bold">
                {t('dictionary.initialRisk')}
              </Text>
              <Text variant="body-large">
                {t('scenarioDrawer.riskMatrixModal.startRisk')}
              </Text>
            </Box>
            <Box sx={headerSection}>
              <Text variant="title-x-small" weight="bold">
                {t('dictionary.restRisk')}
              </Text>
              <Text variant="body-large">
                {t('scenarioDrawer.riskMatrixModal.restRisk')}
              </Text>
            </Box>

            {/* Row 2 */}
            <Select<FormScenario>
              control={control}
              name="risk.probability"
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues(Number(riskProbability))}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.probability"
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues(Number(remainingRiskProbability))}
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
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues(Number(riskConsequence))}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues(Number(remainingRiskConsequence))}
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
