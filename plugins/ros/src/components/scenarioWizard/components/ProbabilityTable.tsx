import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { formLabel } from '../../common/typography';
import TableCell from '@mui/material/TableCell';
import { riskCell, riskTable } from '../wizardStyles';
import Table from '@mui/material/Table';

interface ProbabilityTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ProbabilityTable = ({
  selectedValue,
  handleChange,
}: ProbabilityTableProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const getRadioLabel = (row: number) => {
    /* @ts-ignore Because ts can't typecheck strings agains our keys */
    return `${row}: ${t(`probabilityTable.rows.${row}`)}`;
  };

  const getRadioCell = (row: number) => (
    <th scope="col">
      <FormControlLabel
        sx={{
          width: '100%',
        }}
        control={
          <Radio
            checked={selectedValue === row}
            onChange={() => handleChange(row)}
            sx={{ marginRight: -0.5 }}
          />
        }
        label={getRadioLabel(row)}
        componentsProps={{ typography: { sx: formLabel } }}
      />
    </th>
  );

  const getContentCell = (row: number) => (
    <TableCell sx={riskCell}>
      {/* @ts-ignore */}
      {t(`probabilityTable.cells.${row}`)}
    </TableCell>
  );

  return (
    <Table sx={riskTable}>
      <tbody>
        <tr>
          {getRadioCell(1)}
          {getRadioCell(2)}
          {getRadioCell(3)}
          {getRadioCell(4)}
          {getRadioCell(5)}
        </tr>
        <tr>
          {getContentCell(1)}
          {getContentCell(2)}
          {getContentCell(3)}
          {getContentCell(4)}
          {getContentCell(5)}
        </tr>
      </tbody>
    </Table>
  );
};
