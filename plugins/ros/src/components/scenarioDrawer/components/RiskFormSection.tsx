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

function ScenarioForm({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control } = formMethods;

  const probabilityValues: {
    value: string | number;
    renderedValue: JSX.Element;
  }[] = probabilityOptions.map((value, index) => ({
    value: `${value}`,
    renderedValue: (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {index + 1}
        </Box>
        <span>
          {/* @ts-ignore Because ts can't typecheck strings against our keys */}
          {`${t(`probabilityTable.rows.${index + 1}`)} (${t(
            `infoDialog.probabilityDescription.${index}`,
          )})`}
        </span>
      </Box>
    ),
  }));

  const consequenceValues: {
    value: string | number;
    renderedValue: JSX.Element;
  }[] = consequenceOptions.map((value, index) => ({
    value: `${value}`,
    renderedValue: (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {index + 1}
        </Box>
        <span>
          {/* @ts-ignore Because ts can't typecheck strings against our keys */}
          {`${t(`consequenceTable.rows.${index + 1}`)} (${t(
            `infoDialog.consequenceDescription.${index}`,
          )})`}
        </span>
      </Box>
    ),
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
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues}
            />
            <Select<FormScenario>
              control={control}
              name="risk.consequence"
              label={t('infoDialog.consequenceTitle')}
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
              label={t('infoDialog.probabilityTitle')}
              options={probabilityValues}
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('infoDialog.consequenceTitle')}
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
}

export default ScenarioForm;
