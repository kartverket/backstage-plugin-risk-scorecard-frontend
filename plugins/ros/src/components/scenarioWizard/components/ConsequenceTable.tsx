import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  riskCell,
  riskLabelCell,
  riskRow,
  riskTable,
  riskVoidCell,
} from '../wizardStyles';
import { SxProps, Theme } from '@mui/material/styles';
import { useController, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { RiskRadioButton } from './RiskRadioButton';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import { consequenceOptions } from '../../../utils/constants';
import { Text } from '@backstage/ui';

const consequenceRow: SxProps<Theme> = {
  ...riskRow,
  gridTemplateColumns: 'auto repeat(5, 1fr)',
};

function ConsequenceTableInfo() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function getTextCell(
    resourceKey: string,
    row: number,
    cellType: SxProps<Theme>,
  ) {
    return (
      <Box sx={cellType}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.${resourceKey}.${row + 1}`)}
      </Box>
    );
  }

  function getRow(resourceKey: string, cellType: SxProps<Theme>[]) {
    return (
      <>
        <Box sx={riskLabelCell}>
          <Text as="p" variant="body-large" weight="bold">
            {/* @ts-ignore */}
            {t(`consequenceTable.columns.${resourceKey}`)}
          </Text>
        </Box>
        {getTextCell(resourceKey, 0, cellType[0])}
        {getTextCell(resourceKey, 1, cellType[1])}
        {getTextCell(resourceKey, 2, cellType[2])}
        {getTextCell(resourceKey, 3, cellType[3])}
        {getTextCell(resourceKey, 4, cellType[4])}
      </>
    );
  }

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
}

export function ConsequenceTable({
  formMethods,
  riskType,
}: {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name: `${riskType}.consequence`,
    control: formMethods.control,
  });

  function getRadioLabel(row: number) {
    /* @ts-ignore Because ts can't typecheck strings agains our keys */
    return `${row}: ${t(`consequenceTable.rows.${row}`)}`;
  }

  function getRadioCell(row: number) {
    return (
      <RiskRadioButton
        value={consequenceOptions[row]}
        ref={field.ref}
        label={getRadioLabel(row + 1)}
      />
    );
  }

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
}

export function ConsequenceTableInfoWithHeaders() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function getRadioLabel(row: number) {
    return (
      /* @ts-ignore Because ts can't typecheck strings agains our keys */
      <Text as="p" variant="body-large">{`${row}: ${t(
        `consequenceTable.rows.${row}`,
      )}`}</Text>
    );
  }
  return (
    <Box sx={riskTable}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(5, 1fr)',
          gap: '4px',
          overflow: 'auto',
        }}
      >
        <Box sx={riskLabelCell} />
        {getRadioLabel(1)}
        {getRadioLabel(2)}
        {getRadioLabel(3)}
        {getRadioLabel(4)}
        {getRadioLabel(5)}
      </Box>
      <ConsequenceTableInfo />
    </Box>
  );
}
