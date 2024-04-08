import React from 'react';
import { Step, StepLabel, Stepper } from '@material-ui/core';
import Box from '@material-ui/core/Box';

const ScenarioStepperSteps = [
  'Scenario',
  'Startrisiko',
  'Tiltak',
  'Restrisiko',
] as const;

export type ScenarioStepperSteps = (typeof ScenarioStepperSteps)[number];

interface ScenarioStepperProps {
  step: ScenarioStepperSteps;
  setStep: (step: ScenarioStepperSteps | null) => void;
}

export const ScenarioStepper = ({ step, setStep }: ScenarioStepperProps) => {
  return (
    step && (
      <Box>
        <Stepper
          activeStep={ScenarioStepperSteps.indexOf(step)}
          style={{ background: 'transparent' }}
        >
          {ScenarioStepperSteps.map(label => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    )
  );
};
