import React from 'react';
import { FieldPath, UseFormReturn } from 'react-hook-form';
import { Scenario } from '../../../utils/types';
import TextField from '@material-ui/core/TextField';

const ScenarioForm = ({
  formMethods,
}: {
  formMethods: UseFormReturn<Scenario>;
}) => {
  const { register } = formMethods;

  const muiRegister = (field: FieldPath<Scenario>) => {
    const registerMethods = register(field);
    return {
      ...registerMethods,
      inputRef: registerMethods.ref,
    };
  };

  return (
    <div>
      <TextField {...muiRegister('title')} />
    </div>
  );
};

export default ScenarioForm;
