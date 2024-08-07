import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Typography from '@mui/material/Typography';
import { subtitle1 } from '../../common/typography';
import {
  riskCell,
  riskLabelCell,
  riskRow,
  riskTable,
  riskVoidCell,
} from '../wizardStyles';
import { SxProps, Theme } from '@mui/material/styles';
import { useController, UseFormReturn } from 'react-hook-form';
import { FormScenario, Scenario } from '../../../utils/types';
import { RiskRadioButton } from './RiskRadioButton';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import { consequenceOptions } from '../../../utils/constants';

const consequenceRow: SxProps<Theme> = {
  ...riskRow,
  gridTemplateColumns: 'auto repeat(5, 1fr)',
};

export const ConsequenceTableInfo = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const getTextCell = (
    resourceKey: string,
    row: number,
    cellType: SxProps<Theme>,
  ) => (
    <Box sx={cellType}>
      {/* @ts-ignore */}
      {t(`consequenceTable.cells.${resourceKey}.${row + 1}`)}
    </Box>
  );

  const getRow = (resourceKey: string, cellType: SxProps<Theme>[]) => (
    <>
      <Box sx={riskLabelCell}>
        <Typography sx={{ ...subtitle1, lineHeight: 1 }}>
          {/* @ts-ignore */}
          {t(`consequenceTable.columns.${resourceKey}`)}
        </Typography>
      </Box>
      {getTextCell(resourceKey, 0, cellType[0])}
      {getTextCell(resourceKey, 1, cellType[1])}
      {getTextCell(resourceKey, 2, cellType[2])}
      {getTextCell(resourceKey, 3, cellType[3])}
      {getTextCell(resourceKey, 4, cellType[4])}
    </>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(5, 1fr)',
        gap: '4px',
        overflow: 'auto',
      }}
    >
      {getRow('economical', [riskCell, riskCell, riskCell, riskCell, riskCell])}
      {getRow('privacy', [
        riskCell,
        riskCell,
        riskCell,
        riskCell,
        riskVoidCell,
      ])}
      {getRow('reputation', [
        riskCell,
        riskCell,
        riskCell,
        riskVoidCell,
        riskVoidCell,
      ])}
      {getRow('health', [
        riskVoidCell,
        riskVoidCell,
        riskCell,
        riskCell,
        riskCell,
      ])}
    </Box>
  );
};

export const ConsequenceTable = ({
  formMethods,
  riskType,
}: {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name: `${riskType}.consequence`,
    control: formMethods.control,
  });

  const getRadioLabel = (row: number) => {
    /* @ts-ignore Because ts can't typecheck strings agains our keys */
    return `${row}: ${t(`consequenceTable.rows.${row}`)}`;
  };

  const getRadioCell = (row: number) => (
    <RiskRadioButton
      value={consequenceOptions[row]}
      ref={field.ref}
      label={getRadioLabel(row + 1)}
    />
  );

  return (
    <Box sx={riskTable}>
      <RadioGroup {...field} sx={consequenceRow}>
        <Box sx={riskLabelCell} />
        {getRadioCell(0)}
        {getRadioCell(1)}
        {getRadioCell(2)}
        {getRadioCell(3)}
        {getRadioCell(4)}
      </RadioGroup>
      <ConsequenceTableInfo />
    </Box>
  );
};
