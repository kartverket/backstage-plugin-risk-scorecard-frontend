import React from 'react';
import { Radio } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useTableStyles } from '../konsekvens/KonsekvensTable';

interface ProbabilityTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ProbabilityTable = ({
  selectedValue,
  handleChange,
}: ProbabilityTableProps) => {
  const { table, cell, radio } = useTableStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  const radioCell = (row: number) => (
    <th scope="col">
      <div className={radio}>
        <Radio
          checked={selectedValue === row}
          onChange={() => handleChangeRow(row)}
          style={{ padding: 0, color: '#9BC9FE' }}
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
