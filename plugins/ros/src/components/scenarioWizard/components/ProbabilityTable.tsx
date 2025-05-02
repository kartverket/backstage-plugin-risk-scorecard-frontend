import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { riskTable, riskCell, riskRow, riskLabelCell } from '../wizardStyles';
import { useController, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import Box from '@mui/material/Box';
import { probabilityOptions } from '../../../utils/constants';
import Typography from '@mui/material/Typography';

export function ProbabilityTableInfo() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  function getContentCell(row: number) {
    return (
      <Box sx={riskCell}>
        {/* @ts-ignore */}
        {t(`probabilityTable.cells.${row + 1}`)}
      </Box>
    );
  }

  return (
    <Box sx={riskRow}>
      {getContentCell(0)}
      {getContentCell(1)}
      {getContentCell(2)}
      {getContentCell(3)}
      {getContentCell(4)}
    </Box>
  );
}

export function ProbabilityTable({
  formMethods,
  riskType,
}: {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name: `${riskType}.probability`,
    control: formMethods.control,
  });

  function handleColumnClick(value: string) {
    field.onChange(value);
  }

  function getClickableCell(row: number) {
    const value = probabilityOptions[row];
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
        {`${row + 1}: ${t(`probabilityTable.rows.${row + 1}`)}`}
      </Box>
    );
  }

  return (
    <Box sx={riskTable}>
      <Box sx={riskRow}>
        {getClickableCell(0)}
        {getClickableCell(1)}
        {getClickableCell(2)}
        {getClickableCell(3)}
        {getClickableCell(4)}
      </Box>
      <ProbabilityTableInfo />
    </Box>
  );
}

export function ProbabilityTableInfoWithHeaders() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function getRadioLabel(row: number) {
    return (
      /* @ts-ignore Because ts can't typecheck strings agains our keys */
      <Typography fontWeight={500}>{`${row}: ${t(
        `probabilityTable.rows.${row}`,
      )}`}</Typography>
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
      <ProbabilityTableInfo />
    </Box>
  );
}
