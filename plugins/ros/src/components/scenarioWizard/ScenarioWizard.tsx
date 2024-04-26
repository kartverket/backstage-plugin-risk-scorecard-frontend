import React, { useContext, useState } from 'react';
import {
  CircularProgress,
  makeStyles,
  Step,
  StepButton,
  Stepper,
  Theme,
  Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { useFontStyles } from '../scenarioDrawer/style';
import { ScenarioContext } from '../riScPlugin/ScenarioContext';
import { CloseConfirmation } from '../scenarioDrawer/edit/CloseConfirmation';
import { InitiativesStep } from './steps/InitiativesStep';
import Button from '@mui/material/Button';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { RiskStep } from './steps/RiskStep';
import { useLoadingStyles } from '../riScPlugin/riScPluginStyle';

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: theme.spacing(100),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  stepper: {
    background: 'transparent',
    padding: '2rem 0 2.5rem 0',
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
    gap: theme.spacing(2),
  },
}));

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
}

export const ScenarioWizard = ({ step, isFetching }: ScenarioStepperProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { h1, label } = useFontStyles();
  const classes = useLoadingStyles();

  const {
    root,
    container,
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
    <>
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
                    editScenario(wizardStep);
                  }}
                >
                  {t(`dictionary.${wizardStep}`)}{' '}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <Divider />
          {isFetching && (
            <div className={classes.container}>
              <CircularProgress className={classes.spinner} size={80} />
            </div>
          )}
          {!isFetching && (
            <>
              <Box className={steps}>
                {
                  {
                    [ScenarioWizardSteps[0]]: <ScenarioStep />,
                    [ScenarioWizardSteps[1]]: <RiskStep riskType="initial" />,
                    [ScenarioWizardSteps[2]]: <InitiativesStep />,
                    [ScenarioWizardSteps[3]]: <RiskStep riskType="rest" />,
                  }[step]
                }
              </Box>
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
    </>
  );
};
