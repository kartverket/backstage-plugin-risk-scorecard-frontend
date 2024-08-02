import React, { ReactNode, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { ActionsStep } from './steps/ActionsStep';
import Button from '@mui/material/Button';
import { RiskStep } from './steps/RiskStep';
import Alert from '@mui/material/Alert';
import { Spinner } from '../common/Spinner';
import { CloseConfirmation } from './components/CloseConfirmation';
import {
  scenarioWizardSteps,
  ScenarioWizardSteps,
  useScenario,
} from '../../contexts/ScenarioContext';
import { useRiScs } from '../../contexts/RiScContext';
import Container from '@mui/material/Container';
import { heading1, label } from '../common/typography';
import { useForm } from 'react-hook-form';
import { Scenario } from '../../utils/types';
import { useSearchParams } from 'react-router-dom';

export const ScenarioWizard = ({ step }: { step: ScenarioWizardSteps }) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isFetching, riScUpdateStatus } = useRiScs();
  const [, setSearchParams] = useSearchParams();

  const { scenario, closeScenarioForm, submitNewScenario } = useScenario();

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const formMethods = useForm<Scenario>({
    defaultValues: scenario,
    mode: 'onBlur',
  });

  const { isDirty, isValid } = formMethods.formState;

  const onSubmit = formMethods.handleSubmit((data: Scenario) => {
    submitNewScenario(data, () => closeScenarioForm());
  });

  const close = useCallback(() => {
    closeScenarioForm();
    setShowCloseConfirmation(false);
  }, [closeScenarioForm]);

  const handleCloseStepper = () => {
    if (isDirty) {
      setShowCloseConfirmation(true);
    } else {
      close();
    }
  };

  const selectStep = (newStep: ScenarioWizardSteps) => {
    if (isValid) {
      setSearchParams({ step: newStep });
    } else {
      formMethods.trigger();
    }
  };

  const nextStep = () => {
    const currentIndex = scenarioWizardSteps.indexOf(step);
    if (currentIndex < scenarioWizardSteps.length - 1) {
      selectStep(scenarioWizardSteps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = scenarioWizardSteps.indexOf(step);
    if (currentIndex > 0) {
      selectStep(scenarioWizardSteps[currentIndex - 1]);
    }
  };

  const isFirstStep = step === scenarioWizardSteps.at(0);
  const isLastStep = step === scenarioWizardSteps.at(-1);

  const stepComponents: Record<ScenarioWizardSteps, ReactNode> = {
    scenario: <ScenarioStep formMethods={formMethods} />,
    initialRisk: <RiskStep formMethods={formMethods} riskType="risk" />,
    measure: <ActionsStep formMethods={formMethods} />,
    restRisk: <RiskStep formMethods={formMethods} riskType="remainingRisk" />,
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={heading1}>{t('scenarioDrawer.title')}</Typography>
        <Button variant="outlined" onClick={handleCloseStepper}>
          {t('dictionary.cancel')}
        </Button>
      </Box>
      <Stepper
        activeStep={scenarioWizardSteps.indexOf(step)}
        alternativeLabel
        nonLinear
      >
        {scenarioWizardSteps.map(wizardStep => (
          <Step key={wizardStep} completed={false}>
            <StepButton sx={label} onClick={() => selectStep(wizardStep)}>
              {t(`dictionary.${wizardStep}`)}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <Divider />
      {isFetching ? (
        <Spinner size={80} />
      ) : (
        <>
          {stepComponents[step]}
          {riScUpdateStatus.isError && (
            <Alert severity="error">
              <Typography>{t('dictionary.saveError')}</Typography>
            </Alert>
          )}
          <Box
            sx={{
              display: 'flex',
              gap: '16px',
            }}
          >
            {!isFirstStep && (
              <Button onClick={previousStep} startIcon={<KeyboardArrowLeft />}>
                {t('dictionary.previous')}
              </Button>
            )}

            <Button
              variant={isLastStep ? 'contained' : 'outlined'}
              onClick={onSubmit}
              disabled={!isDirty || riScUpdateStatus.isLoading}
              sx={{ marginLeft: 'auto' }}
            >
              {t('dictionary.saveAndClose')}
            </Button>
            {!isLastStep && (
              <Button
                variant="contained"
                onClick={nextStep}
                endIcon={<KeyboardArrowRight />}
              >
                {t('dictionary.next')}
              </Button>
            )}
          </Box>
        </>
      )}
      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={onSubmit}
      />
    </Container>
  );
};
