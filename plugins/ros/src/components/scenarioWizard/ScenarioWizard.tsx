import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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

export const ScenarioWizard = ({ step }: { step: ScenarioWizardSteps }) => {
  const wizardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isFetching, riScUpdateStatus } = useRiScs();

  const {
    scenario,
    originalScenario,
    saveScenario,
    closeScenario,
    editScenario,
    validateScenario,
    hasFormErrors,
  } = useScenario();

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [restEqualsInitial, setRestEqualsInitial] = useState(true);
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
    if (riScUpdateStatus.isSuccess && canCloseIfSuccessfull) {
      close();
    } else if (riScUpdateStatus.isError && wizardRef.current) {
      setShowCloseConfirmation(false);
      wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [canCloseIfSuccessfull, close, riScUpdateStatus]);

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

  const isFirstStep = step === scenarioWizardSteps.at(0);
  const isLastStep = step === scenarioWizardSteps.at(-1);

  const stepComponents: Record<ScenarioWizardSteps, ReactNode> = {
    scenario: <ScenarioStep />,
    initialRisk: (
      <RiskStep riskType="initial" restEqualsInitial={restEqualsInitial} />
    ),
    measure: <ActionsStep />,
    restRisk: <RiskStep riskType="rest" />,
  };

  return (
    <Container
      ref={wizardRef}
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
            <StepButton
              disabled={false}
              sx={label}
              color="inherit"
              onClick={() => {
                if (validateScenario()) editScenario(wizardStep);
              }}
            >
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
              onClick={saveAndClose}
              disabled={riScUpdateStatus.isLoading}
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
        save={saveAndClose}
      />
    </Container>
  );
};
