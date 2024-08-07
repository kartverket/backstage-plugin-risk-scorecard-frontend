import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { riskTable, riskCell, riskRow } from '../wizardStyles';
import { useController, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { RiskRadioButton } from './RiskRadioButton';
import RadioGroup from '@mui/material/RadioGroup';
import Box from '@mui/material/Box';
import { probabilityOptions } from '../../../utils/constants';

export const ProbabilityTableInfo = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const getContentCell = (row: number) => (
    <Box sx={riskCell}>
      {/* @ts-ignore */}
      {t(`probabilityTable.cells.${row + 1}`)}
    </Box>
  );

  return (
    <Box sx={riskRow}>
      {getContentCell(1)}
      {getContentCell(0)}
      {getContentCell(2)}
      {getContentCell(3)}
      {getContentCell(4)}
    </Box>
  );
};

export const ProbabilityTable = ({
  formMethods,
  riskType,
}: {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name: `${riskType}.probability`,
    control: formMethods.control,
  });

  const getRadioLabel = (row: number) => {
    /* @ts-ignore Because ts can't typecheck strings agains our keys */
    return `${row}: ${t(`probabilityTable.rows.${row}`)}`;
  };

  const getRadioCell = (row: number) => (
    <RiskRadioButton
      value={probabilityOptions[row]}
      ref={field.ref}
      label={getRadioLabel(row + 1)}
    />
  );

  return (
    <Box sx={riskTable}>
      <RadioGroup {...field} sx={riskRow}>
        {getRadioCell(0)}
        {getRadioCell(1)}
        {getRadioCell(2)}
        {getRadioCell(3)}
        {getRadioCell(4)}
      </RadioGroup>
      <ProbabilityTableInfo />
    </Box>
  );
};
