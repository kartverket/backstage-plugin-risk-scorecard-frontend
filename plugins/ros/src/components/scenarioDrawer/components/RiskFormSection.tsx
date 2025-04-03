import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  consequenceOptions,
  probabilityOptions,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { heading3 } from '../../common/typography';
import {
  headerSection,
  riscSection,
  section,
  selectSection,
} from '../scenarioDrawerComponents';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

const ScenarioForm = ({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control } = formMethods;

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
              label={t('dictionary.probability')}
              options={probabilityValues}
            />
            <Select<FormScenario>
              control={control}
              name="risk.consequence"
              label={t('dictionary.consequence')}
              options={consequenceValues}
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
              label={t('dictionary.probability')}
              options={probabilityValues}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('dictionary.consequence')}
              options={consequenceValues}
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
};

export default ScenarioForm;
