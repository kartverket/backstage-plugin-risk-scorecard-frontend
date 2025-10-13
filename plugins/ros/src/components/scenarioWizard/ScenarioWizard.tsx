import { ReactNode, useCallback, useState } from 'react';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { ScenarioStep } from './steps/ScenarioStep';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Divider from '@mui/material/Divider';
import { ActionsStep } from './steps/ActionsStep';
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
import { label } from '../common/typography';
import { useForm } from 'react-hook-form';
import { FormScenario, Scenario } from '../../utils/types';
import { useSearchParams } from 'react-router-dom';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import { Text, Button, Flex } from '@backstage/ui';

export function ScenarioWizard({ step }: { step: ScenarioWizardSteps }) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isFetching, response, updateStatus } = useRiScs();
  const [, setSearchParams] = useSearchParams();

  const { scenario, emptyFormScenario, closeScenarioForm, submitNewScenario } =
    useScenario();

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const formMethods = useForm<FormScenario>({
    defaultValues: emptyFormScenario(scenario),
    mode: 'onBlur',
  });

  const { isDirty, isValid } = formMethods.formState;

  const onSubmit = formMethods.handleSubmit((data: FormScenario) => {
    const submitScenario: Scenario = {
      ...data,
      risk: {
        ...data.risk,
        probability: Number(data.risk.probability),
        consequence: Number(data.risk.consequence),
      },
      remainingRisk: {
        ...data.remainingRisk,
        probability: Number(data.remainingRisk.probability),
        consequence: Number(data.remainingRisk.consequence),
      },
    };

    formMethods.trigger();

    if (isValid) {
      submitNewScenario(submitScenario, () => closeScenarioForm());
    } else {
      formMethods.trigger();
    }
  });

  const close = useCallback(() => {
    closeScenarioForm();
    setShowCloseConfirmation(false);
  }, [closeScenarioForm]);

  function handleCloseStepper() {
    if (isDirty) {
      setShowCloseConfirmation(true);
    } else {
      close();
    }
  }

  function selectStep(newStep: ScenarioWizardSteps) {
    if (isValid) {
      setSearchParams({ step: newStep });
    } else {
      formMethods.trigger();
    }
  }

  function nextStep() {
    const currentIndex = scenarioWizardSteps.indexOf(step);
    if (currentIndex < scenarioWizardSteps.length - 1) {
      selectStep(scenarioWizardSteps[currentIndex + 1]);
    }
  }

  function previousStep() {
    const currentIndex = scenarioWizardSteps.indexOf(step);
    if (currentIndex > 0) {
      selectStep(scenarioWizardSteps[currentIndex - 1]);
    }
  }

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
      <Flex justify="between">
        <Text variant="title-medium" weight="bold">
          {t('scenarioDrawer.title')}
        </Text>
        <Button
          size="medium"
          variant="secondary"
          onClick={handleCloseStepper}
          style={{ color: '#1f5493' }}
        >
          {t('dictionary.cancel')}
        </Button>
      </Flex>
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

          {response && (
            <Alert severity={getAlertSeverity(updateStatus)}>
              <Text variant="body-large">{response.statusMessage}</Text>
            </Alert>
          )}
          <Flex justify={isFirstStep ? 'end' : 'between'}>
            {!isFirstStep && (
              <Button
                size="medium"
                variant="tertiary"
                onClick={previousStep}
                iconStart={<KeyboardArrowLeft />}
                style={{ color: '#1f5493' }}
              >
                {t('dictionary.previous')}
              </Button>
            )}
            <Flex gap="16px">
              <Button
                variant={isLastStep ? 'primary' : 'secondary'}
                onClick={onSubmit}
                size="medium"
                isDisabled={!isDirty || updateStatus.isLoading}
                style={{
                  color: !isLastStep ? '#1f5493' : undefined,
                }}
              >
                {t('dictionary.saveAndClose')}
              </Button>

              {!isLastStep && (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={nextStep}
                  iconEnd={<KeyboardArrowRight />}
                >
                  {t('dictionary.next')}
                </Button>
              )}
            </Flex>
          </Flex>
        </>
      )}
      <CloseConfirmation
        isOpen={showCloseConfirmation}
        onCloseDialog={() => setShowCloseConfirmation(false)}
        close={close}
        save={onSubmit}
      />
    </Container>
  );
}
