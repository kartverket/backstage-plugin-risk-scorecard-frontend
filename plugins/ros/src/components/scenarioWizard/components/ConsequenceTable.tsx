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
import { FormScenario } from '../../../utils/types';
import Box from '@mui/material/Box';
import { consequenceOptions } from '../../../utils/constants';

const consequenceRow: SxProps<Theme> = {
  ...riskRow,
  gridTemplateColumns: 'auto repeat(5, 1fr)',
};

export function ConsequenceTableInfo() {
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

  function handleColumnClick(value: string) {
    field.onChange(value);
  }

  function getClickableCell(row: number) {
    const value = consequenceOptions[row];
    const isSelected = Number(field.value) === value;

    return (
      <Box
        sx={{
          ...riskCell,
          cursor: 'pointer',
          backgroundColor: isSelected ? 'primary.main' : 'transparent',
          color: isSelected ? 'white' : 'inherit',
          textAlign: 'center',
          padding: '8px',
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : 'grey.300',
        }}
        onClick={() => handleColumnClick(value.toString())}
      >
        {/* @ts-ignore */}
        {`${row + 1}: ${t(`consequenceTable.rows.${row + 1}`)}`}
      </Box>
    );
  }

  return (
    <Box sx={riskTable}>
      <Box sx={consequenceRow}>
        <Box sx={riskLabelCell} />
        {getClickableCell(0)}
        {getClickableCell(1)}
        {getClickableCell(2)}
        {getClickableCell(3)}
        {getClickableCell(4)}
      </Box>
      <ConsequenceTableInfo />
    </Box>
  );
}

export function ConsequenceTableInfoWithHeaders() {
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
        {consequenceOptions.map((option, row) => (
          <Box key={row}>{option}</Box>
        ))}
      </Box>
      <ConsequenceTableInfo />
    </Box>
  );
}
