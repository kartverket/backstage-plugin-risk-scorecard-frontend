import React, { useContext, useEffect, useRef, useState } from 'react';
import { Step, StepButton, Stepper, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { ScenarioContext } from '../riScPlugin/ScenarioContext';
import { ActionsStep } from './steps/ActionsStep';
import Button from '@mui/material/Button';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { RiskStep } from './steps/RiskStep';
import Alert from '@mui/material/Alert';
import { useFontStyles } from '../utils/style';
import { useWizardStyle } from './scenarioWizardStyle';
import { Spinner } from '../utils/Spinner';
import { CloseConfirmation } from './components/CloseConfirmation';

export const ScenarioWizardSteps = [
  'scenario',
  'initialRisk',
  'measure',
  'restRisk',
] as const;

export type ScenarioWizardSteps = (typeof ScenarioWizardSteps)[number];

interface ScenarioStepperProps {
  step: ScenarioWizardSteps;
  isFetching: boolean;
  updateStatus: { isLoading: boolean; isSuccess: boolean; isError: boolean };
}

export const ScenarioWizard = ({
  step,
  isFetching,
  updateStatus,
}: ScenarioStepperProps) => {
  const wizardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1, label } = useFontStyles();

  const {
    root,
    container,
    header,
    stepper,
    steps,
    buttonContainer,
    buttonContainerRight,
    saveAndNextButtons,
  } = useWizardStyle();

  const {
    scenario,
    originalScenario,
    isNewScenario,
    saveScenario,
    closeScenario,
    editScenario,
    validateScenario,
  } = useContext(ScenarioContext)!!;

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [restEqualsInitial, setRestEqualsInitial] = useState(isNewScenario);

  useEffect(() => {
    if (step === 'restRisk') setRestEqualsInitial(false);
  }, [step]);

  useEffect(() => {
    if (updateStatus.isSuccess) {
      close();
    } else if (updateStatus.isError && wizardRef.current) {
      setShowCloseConfirmation(false);
      wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [updateStatus]);

  const close = () => {
    closeScenario();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    saveScenario();
  };

  const handleCloseStepper = () => {
    if (JSON.stringify(scenario) !== JSON.stringify(originalScenario)) {
      setShowCloseConfirmation(true);
    } else {
      close();
    }
  };

  const nextStep = () => {
    const isValidScenario = validateScenario();
    if (isValidScenario) {
      const currentIndex = ScenarioWizardSteps.indexOf(step);
      if (currentIndex < ScenarioWizardSteps.length - 1) {
        editScenario(ScenarioWizardSteps[currentIndex + 1]);
      }
    }
  };

  const previousStep = () => {
    const currentIndex = ScenarioWizardSteps.indexOf(step);
    if (currentIndex > 0) {
      editScenario(ScenarioWizardSteps[currentIndex - 1]);
    }
  };

  const isFirstStep = () => {
    return ScenarioWizardSteps.indexOf(step) === 0;
  };

  const isLastStep = () => {
    return ScenarioWizardSteps.indexOf(step) === ScenarioWizardSteps.length - 1;
  };

  return (
    <div ref={wizardRef}>
      <Box className={root}>
        <Box className={container}>
          <Box className={header}>
            <Typography className={h1}>{t('scenarioDrawer.title')}</Typography>
            <Button variant="outlined" onClick={handleCloseStepper}>
              {t('dictionary.cancel')}
            </Button>
          </Box>
          <Stepper
            className={stepper}
            activeStep={ScenarioWizardSteps.indexOf(step)}
            alternativeLabel
          >
            {ScenarioWizardSteps.map(wizardStep => (
              <Step key={wizardStep} completed={false}>
                <StepButton
                  disabled={false}
                  className={label}
                  color="inherit"
                  onClick={() => {
                    if (validateScenario()) editScenario(wizardStep);
                  }}
                >
                  {t(`dictionary.${wizardStep}`)}{' '}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <Divider />
          {isFetching ? (
            <Spinner size={80} />
          ) : (
            <>
              <Box className={steps}>
                {
                  {
                    [ScenarioWizardSteps[0]]: <ScenarioStep />,
                    [ScenarioWizardSteps[1]]: (
                      <RiskStep
                        riskType="initial"
                        restEqualsInitial={restEqualsInitial}
                      />
                    ),
                    [ScenarioWizardSteps[2]]: <ActionsStep />,
                    [ScenarioWizardSteps[3]]: <RiskStep riskType="rest" />,
                  }[step]
                }
              </Box>
              {updateStatus.isError && (
                <Alert style={{ marginBottom: '1rem' }} severity="error">
                  <Typography>{t('dictionary.saveError')}</Typography>
                </Alert>
              )}
              <Box
                className={
                  isFirstStep() ? buttonContainerRight : buttonContainer
                }
              >
                {!isFirstStep() && (
                  <Button
                    onClick={previousStep}
                    startIcon={<KeyboardArrowLeft />}
                  >
                    {t('dictionary.previous')}
                  </Button>
                )}
                <Box className={saveAndNextButtons}>
                  <Button
                    variant={isLastStep() ? 'contained' : 'outlined'}
                    onClick={saveAndClose}
                    disabled={updateStatus.isLoading}
                  >
                    {t('dictionary.saveAndClose')}
                  </Button>
                  {!isLastStep() && (
                    <Button
                      variant="contained"
                      onClick={nextStep}
                      endIcon={<KeyboardArrowRight />}
                    >
                      {t('dictionary.next')}
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={saveAndClose}
      />
    </div>
  );
};
