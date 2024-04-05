import React from 'react';
import { Step, StepLabel, Stepper } from '@material-ui/core';

const steps = ['Scenario', 'Startrisiko', 'Tiltak', 'Restrisiko'];

export const ScenarioStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Stepper activeStep={activeStep}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
