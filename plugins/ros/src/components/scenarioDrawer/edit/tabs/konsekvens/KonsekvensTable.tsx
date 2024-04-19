import React from 'react';
import { makeStyles, Radio, Theme, Typography } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const useTableStyles = makeStyles((theme: Theme) => ({
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0.3rem 0',
    width: '100%',
    tableLayout: 'fixed',
  },
  labelCell: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
    width: '2rem !important',
    textTransform: 'uppercase',
  },
  cell: {
    padding: theme.spacing(1.5),
    border: '1px solid grey',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  voidCell: {
    padding: theme.spacing(1.5),
    border: '1px solid grey',
    color: theme.palette.type === 'dark' ? '#9E9E9E' : '#757575',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0.5rem 0',
    gap: '0.3rem',
    textTransform: 'uppercase',
  },
}));

interface ConsequenceTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const ConsequenceTable = ({
  selectedValue,
  handleChange,
}: ConsequenceTableProps) => {
  const { table, labelCell, cell, voidCell, radio } = useTableStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  const getRadioCell = (row: number) => {
    return (
      <th scope="col">
        <div className={radio}>
          <Radio
            checked={selectedValue === row}
            onChange={() => handleChangeRow(row)}
            style={{ padding: 0, color: '#9BC9FE' }}
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
        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
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
