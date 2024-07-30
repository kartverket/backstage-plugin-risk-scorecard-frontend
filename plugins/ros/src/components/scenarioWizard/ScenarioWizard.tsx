import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Step, StepButton, Stepper, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { ActionsStep } from './steps/ActionsStep';
import Button from '@mui/material/Button';
import { RiskStep } from './steps/RiskStep';
import Alert from '@mui/material/Alert';
import { useFontStyles } from '../../utils/style';
import { useWizardStyle } from './scenarioWizardStyle';
import { Spinner } from '../common/Spinner';
import { CloseConfirmation } from './components/CloseConfirmation';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import { useScenario } from '../../contexts/ScenarioContext';

const scenarioWizardSteps = [
  'scenario',
  'initialRisk',
  'measure',
  'restRisk',
] as const;

export type ScenarioWizardSteps = (typeof scenarioWizardSteps)[number];

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
    button,
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
    hasFormErrors,
  } = useScenario();

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [restEqualsInitial, setRestEqualsInitial] = useState(isNewScenario);
  // This boolean prevents the wizard from closing when opening it with a newly successfull request.
  const [canCloseIfSuccessfull, setCanCloseIfSuccessfull] = useState(false);

  useEffect(() => {
    if (step === 'restRisk') setRestEqualsInitial(false);
  }, [step]);

  const close = useCallback(() => {
    closeScenario();
    setShowCloseConfirmation(false);
  }, [closeScenario]);

  useEffect(() => {
    if (updateStatus.isSuccess && canCloseIfSuccessfull) {
      close();
    } else if (updateStatus.isError && wizardRef.current) {
      setShowCloseConfirmation(false);
      wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [canCloseIfSuccessfull, close, updateStatus]);

  const saveAndClose = () => {
    if (hasFormErrors()) {
      return;
    }

    saveScenario();
    setCanCloseIfSuccessfull(true);
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
      const currentIndex = scenarioWizardSteps.indexOf(step);
      if (currentIndex < scenarioWizardSteps.length - 1) {
        editScenario(scenarioWizardSteps[currentIndex + 1]);
      }
    }
  };

  const previousStep = () => {
    const currentIndex = scenarioWizardSteps.indexOf(step);
    if (currentIndex > 0) {
      editScenario(scenarioWizardSteps[currentIndex - 1]);
    }
  };

  const isFirstStep = () => {
    return scenarioWizardSteps.indexOf(step) === 0;
  };

  const isLastStep = () => {
    return scenarioWizardSteps.indexOf(step) === scenarioWizardSteps.length - 1;
  };

  return (
    <div ref={wizardRef}>
      <Box className={root}>
        <Box className={container}>
          <Box className={header}>
            <Typography className={h1}>{t('scenarioDrawer.title')}</Typography>
            <Button
              variant="outlined"
              className={button}
              onClick={handleCloseStepper}
            >
              {t('dictionary.cancel')}
            </Button>
          </Box>
          <Stepper
            className={stepper}
            activeStep={scenarioWizardSteps.indexOf(step)}
            alternativeLabel
          >
            {scenarioWizardSteps.map(wizardStep => (
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
                    [scenarioWizardSteps[0]]: <ScenarioStep />,
                    [scenarioWizardSteps[1]]: (
                      <RiskStep
                        riskType="initial"
                        restEqualsInitial={restEqualsInitial}
                      />
                    ),
                    [scenarioWizardSteps[2]]: <ActionsStep />,
                    [scenarioWizardSteps[3]]: <RiskStep riskType="rest" />,
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
                    className={button}
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
