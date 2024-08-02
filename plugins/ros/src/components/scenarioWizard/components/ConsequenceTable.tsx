import React from 'react';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { formLabel, subtitle1 } from '../../common/typography';
import {
  riskCell,
  riskLabelCell,
  riskTable,
  riskVoidCell,
} from '../wizardStyles';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import { SxProps, Theme } from '@mui/material/styles';

interface ConsequenceTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ConsequenceTable = ({
  selectedValue,
  handleChange,
}: ConsequenceTableProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const getRadioLabel = (row: number) => {
    /* @ts-ignore Because ts can't typecheck strings agains our keys */
    return `${row}: ${t(`consequenceTable.rows.${row}`)}`;
  };

  const getRadioCell = (row: number) => {
    return (
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
  };

  const getTextCell = (
    resourceKey: string,
    row: number,
    cellType: SxProps<Theme>,
  ) => (
    <TableCell sx={cellType}>
      {/* @ts-ignore */}
      {t(`consequenceTable.cells.${resourceKey}.${row}`)}
    </TableCell>
  );

  const getRow = (resourceKey: string, cellType: SxProps<Theme>[]) => (
    <tr>
      <TableCell scope="row" sx={riskLabelCell}>
        <Typography sx={{ ...subtitle1, lineHeight: 1 }}>
          {/* @ts-ignore */}
          {t(`consequenceTable.columns.${resourceKey}`)}
        </Typography>
      </TableCell>
      {getTextCell(resourceKey, 1, cellType[0])}
      {getTextCell(resourceKey, 2, cellType[1])}
      {getTextCell(resourceKey, 3, cellType[2])}
      {getTextCell(resourceKey, 4, cellType[3])}
      {getTextCell(resourceKey, 5, cellType[4])}
    </tr>
  );

  return (
    <Table sx={riskTable}>
      <tbody>
        <tr>
          <td />
          {getRadioCell(1)}
          {getRadioCell(2)}
          {getRadioCell(3)}
          {getRadioCell(4)}
          {getRadioCell(5)}
        </tr>
        {getRow('economical', [
          riskCell,
          riskCell,
          riskCell,
          riskCell,
          riskCell,
        ])}
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
      </tbody>
    </Table>
  );
};
