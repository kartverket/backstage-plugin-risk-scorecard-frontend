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

function createValues(
  options: string[] | number[],
  translationKey: string,
  indexToTranslationKeyMap: Record<string, string>,
  t: (key: string) => string,
): { value: string; renderedValue: (isSelected: boolean) => JSX.Element }[] {
  return options.map((value, index) => ({
    value: `${value}`,
    renderedValue: (isSelected: boolean) => (
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
            backgroundColor: isSelected ? 'primary.main' : 'transparent',
            border: '1px solid',
            borderColor: isSelected ? 'primary.main' : 'primary.main',
            color: isSelected ? 'white' : 'primary.main',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {index + 1}
        </Box>
        <span>
          {/* @ts-ignore Because ts can't typecheck strings against our keys */}
          {`${t(`${translationKey}.rows.${index + 1}`)} (${t(
            indexToTranslationKeyMap[index],
          )})`}
        </span>
      </Box>
    ),
  }));
}

function ScenarioForm({
  formMethods,
  setIsMatrixDialogOpen,
}: {
  formMethods: UseFormReturn<FormScenario>;
  setIsMatrixDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { control } = formMethods;

  const probabilityValues = createValues(
    probabilityOptions,
    'probabilityTable',
    probabilityIndexToTranslationKeys,
    t as (key: string) => string,
  );

  const consequenceValues = createValues(
    consequenceOptions,
    'consequenceTable',
    consequenceIndexToTranslationKeys,
    t as (key: string) => string,
  );

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
              options={probabilityValues.map(option => ({
                ...option,
                renderedValue: option.renderedValue(
                  option.value ===
                    `${
                      probabilityOptions[
                        findProbabilityIndex(
                          Number(formMethods.getValues('risk.probability')),
                        )
                      ]
                    }`,
                ),
              }))}
              value={
                probabilityValues.find(
                  option =>
                    option.value ===
                    `${
                      probabilityOptions[
                        findProbabilityIndex(
                          Number(formMethods.getValues('risk.probability')),
                        )
                      ]
                    }`,
                )?.value || `${probabilityOptions[0]}`
              }
            />
            <Select<FormScenario>
              control={control}
              name="risk.consequence"
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues.map(option => ({
                ...option,
                renderedValue: option.renderedValue(
                  option.value ===
                    `${
                      consequenceOptions[
                        findConsequenceIndex(
                          Number(formMethods.getValues('risk.consequence')),
                        )
                      ]
                    }`,
                ),
              }))}
              value={
                consequenceValues.find(
                  option =>
                    option.value ===
                    `${
                      consequenceOptions[
                        findConsequenceIndex(
                          Number(formMethods.getValues('risk.consequence')),
                        )
                      ]
                    }`,
                )?.value || `${consequenceOptions[0]}`
              }
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
              options={probabilityValues.map(option => ({
                ...option,
                renderedValue: option.renderedValue(
                  option.value ===
                    `${
                      probabilityOptions[
                        findProbabilityIndex(
                          Number(
                            formMethods.getValues('remainingRisk.probability'),
                          ),
                        )
                      ]
                    }`,
                ),
              }))}
              value={
                probabilityValues.find(
                  option =>
                    option.value ===
                    `${
                      probabilityOptions[
                        findProbabilityIndex(
                          Number(
                            formMethods.getValues('remainingRisk.probability'),
                          ),
                        )
                      ]
                    }`,
                )?.value || `${probabilityOptions[0]}`
              }
            />
            <Select<FormScenario>
              control={control}
              name="remainingRisk.consequence"
              label={t('infoDialog.consequenceTitle')}
              options={consequenceValues.map(option => ({
                ...option,
                renderedValue: option.renderedValue(
                  option.value ===
                    `${
                      consequenceOptions[
                        findConsequenceIndex(
                          Number(
                            formMethods.getValues('remainingRisk.consequence'),
                          ),
                        )
                      ]
                    }`,
                ),
              }))}
              value={
                consequenceValues.find(
                  option =>
                    option.value ===
                    `${
                      consequenceOptions[
                        findConsequenceIndex(
                          Number(
                            formMethods.getValues('remainingRisk.consequence'),
                          ),
                        )
                      ]
                    }`,
                )?.value || `${consequenceOptions[0]}`
              }
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
