import React from 'react';
import { Radio, useTheme } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { useTableStyles } from './tableStyles';

interface ProbabilityTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ProbabilityTable = ({
  selectedValue,
  handleChange,
}: ProbabilityTableProps) => {
  const theme = useTheme();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { table, cell, radio } = useTableStyles();

  const radioCell = (row: number) => (
    <th scope="col">
      <div className={radio}>
        <Radio
          checked={selectedValue === row}
          onChange={() => handleChange(row)}
          style={{
            padding: 0,
            color:
              theme.palette.type === 'dark'
                ? '#9BC9FE'
                : theme.palette.primary.main,
          }}
        />
        {/* @ts-ignore */}
        {row}: {t(`probabilityTable.rows.${row}`)}
      </div>
    </th>
  );

  const contentCell = (row: number) => (
    <td className={cell}>
      {/* @ts-ignore */}
      {t(`probabilityTable.cells.${row}`)}
    </td>
  );

  return (
    <table className={table}>
      <tbody>
        <tr>
          {radioCell(1)}
          {radioCell(2)}
          {radioCell(3)}
          {radioCell(4)}
          {radioCell(5)}
        </tr>
        <tr>
          {contentCell(1)}
          {contentCell(2)}
          {contentCell(3)}
          {contentCell(4)}
          {contentCell(5)}
        </tr>
      </tbody>
    </table>
  );
};
