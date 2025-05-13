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
import {
  consequenceIndexToTranslationKeys,
  findConsequenceIndex,
  findProbabilityIndex,
  probabilityIndexToTranslationKeys,
} from '../../../utils/utilityfunctions';
import { Select } from '../../common/Select';
import { heading3 } from '../../common/typography';
import {
  headerSection,
  riscSection,
  section,
  selectSection,
} from '../scenarioDrawerComponents';
import RiskOptionDisplay from './RiskOptionDisplay';

function ScenarioForm({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { watch, control } = formMethods;

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
          <Box sx={headerSection}>
            <Typography sx={{ ...heading3, justifySelf: 'start' }}>
              {t('dictionary.initialRisk')}
            </Typography>
            <Typography>
              {t('scenarioDrawer.riskMatrixModal.startRisk')}
            </Typography>
          </Box>
          <Box sx={selectSection}>
            <Select<FormScenario>
              control={control}
              name="risk.probability"
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues(Number(riskProbability))}
            />
            <Select<FormScenario>
              control={control}
              name="risk.consequence"
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues(Number(riskConsequence))}
            />
          </Box>
        </Paper>
        <Paper sx={riscSection}>
          <Box sx={headerSection}>
            <Typography sx={{ ...heading3, justifySelf: 'flex-start' }}>
              {t('dictionary.restRisk')}
            </Typography>
            <Typography>
              {t('scenarioDrawer.riskMatrixModal.restRisk')}
            </Typography>
          </Box>
          <Box sx={selectSection}>
            <Select<FormScenario>
              control={control}
              name="remainingRisk.probability"
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues(Number(remainingRiskProbability))}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues(Number(remainingRiskConsequence))}
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
