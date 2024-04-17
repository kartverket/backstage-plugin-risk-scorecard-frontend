import React, { useContext, useState } from 'react';
import {
  Button,
  makeStyles,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { useFontStyles } from '../scenarioDrawer/style';
import { ScenarioContext } from '../rosPlugin/ScenarioContext';
import { CloseConfirmation } from '../scenarioDrawer/edit/CloseConfirmation';
import { StartRiskStep } from './steps/StartRiskStep';
import { InitiativesStep } from './steps/InitiativesStep';
import { RestRiskStep } from './steps/RestRiskStep';

const useStyle = makeStyles({
  root: {
    margin: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  stepper: {
    background: 'transparent',
  },
  steps: {
    padding: '1rem 0 1rem 0',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainerRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  saveAndNextButtons: {
    display: 'flex',
    gap: '1rem',
  },
});

const ScenarioWizardSteps = [
  'scenario',
  'startrisiko',
  'tiltak',
  'restrisiko',
] as const;

export type ScenarioWizardSteps = (typeof ScenarioWizardSteps)[number];

interface ScenarioStepperProps {
  step: ScenarioWizardSteps;
}

export const ScenarioWizard = ({ step }: ScenarioStepperProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1, label } = useFontStyles();

  const {
    root,
    header,
    stepper,
    steps,
    buttonContainer,
    buttonContainerRight,
    saveAndNextButtons,
  } = useStyle();

  const {
    scenario,
    originalScenario,
    saveScenario,
    closeScenario,
    editScenario,
  } = useContext(ScenarioContext)!!;

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const close = () => {
    closeScenario();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    if (saveScenario()) {
      close();
    }
  };

  const handleCloseStepper = () => {
    if (JSON.stringify(scenario) !== JSON.stringify(originalScenario)) {
      setShowCloseConfirmation(true);
    } else {
      close();
    }
  };

  const nextStep = () => {
    const currentIndex = ScenarioWizardSteps.indexOf(step);
    if (currentIndex < ScenarioWizardSteps.length - 1) {
      editScenario(ScenarioWizardSteps[currentIndex + 1]);
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
    step && (
      <>
        <Box className={root}>
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
            {ScenarioWizardSteps.map(stepLabel => {
              const stepProps = {
                completed: false,
                style: {
                  backgroundColor: 'transparent',
                },
              };
              const labelProps = {};
              return (
                <Step key={stepLabel} {...stepProps}>
                  <StepLabel {...labelProps}>
                    <Typography className={label}>
                      {stepLabel.charAt(0).toUpperCase() + stepLabel.slice(1)}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <Divider />
          <Box className={steps}>
            {
              {
                [ScenarioWizardSteps[0]]: <ScenarioStep />,
                [ScenarioWizardSteps[1]]: <StartRiskStep />,
                [ScenarioWizardSteps[2]]: <InitiativesStep />,
                [ScenarioWizardSteps[3]]: <RestRiskStep />,
              }[step]
            }
          </Box>
          <Box
            className={isFirstStep() ? buttonContainerRight : buttonContainer}
          >
            {!isFirstStep() && (
              <Button onClick={previousStep}>{t('dictionary.previous')}</Button>
            )}
            <Box className={saveAndNextButtons}>
              <Button
                variant={isLastStep() ? 'contained' : 'outlined'}
                onClick={saveAndClose}
              >
                {t('dictionary.saveAndClose')}
              </Button>
              {!isLastStep() && (
                <Button variant="contained" onClick={nextStep}>
                  {t('dictionary.next')}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        <CloseConfirmation
          isOpen={showCloseConfirmation}
          close={close}
          save={saveAndClose}
        />
      </>
    )
  );
};
