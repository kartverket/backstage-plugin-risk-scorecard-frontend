import React from 'react';
import { Radio, Typography, useTheme } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useTableStyles } from './tableStyles';

interface ConsequenceTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ConsequenceTable = ({
  selectedValue,
  handleChange,
}: ConsequenceTableProps) => {
  const theme = useTheme();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { table, labelCell, cell, voidCell, radio } = useTableStyles();

  const getRadioCell = (row: number) => {
    return (
      <th scope="col">
        <div className={radio}>
          <Radio
            checked={selectedValue === row}
            onChange={() => handleChange(row)}
            style={{
              padding: 0,
              color:
                theme.palette.type === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
            }}
          />
          {/* @ts-ignore */}
          {row}: {t(`consequenceTable.rows.${row}`)}
        </div>
      </th>
    );
  };

  const getTextCell = (resourceKey: string, row: number, className: string) => (
    <td className={className}>
      {/* @ts-ignore */}
      {t(`consequenceTable.cells.${resourceKey}.${row}`)}
    </td>
  );

  const getRow = (resourceKey: string, cellType: string[]) => (
    <tr>
      <th scope="row" className={labelCell}>
        <Typography
          variant="subtitle1"
          style={{
            fontWeight: 'bold',
            paddingBottom: '0.7rem',
            paddingTop: '0.7rem',
          }}
        >
          {/* @ts-ignore */}
          {t(`consequenceTable.columns.${resourceKey}`)}
        </Typography>
      </th>
      {getTextCell(resourceKey, 1, cellType[0])}
      {getTextCell(resourceKey, 2, cellType[1])}
      {getTextCell(resourceKey, 3, cellType[2])}
      {getTextCell(resourceKey, 4, cellType[3])}
      {getTextCell(resourceKey, 5, cellType[4])}
    </tr>
  );

  return (
    <table className={table}>
      <tbody>
        <tr>
          <td className={labelCell} />
          {getRadioCell(1)}
          {getRadioCell(2)}
          {getRadioCell(3)}
          {getRadioCell(4)}
          {getRadioCell(5)}
        </tr>
        {getRow('economical', [cell, cell, cell, cell, cell])}
        {getRow('privacy', [cell, cell, cell, cell, voidCell])}
        {getRow('reputation', [cell, cell, cell, voidCell, voidCell])}
        {getRow('health', [voidCell, voidCell, cell, cell, cell])}
      </tbody>
    </table>
  );
};
