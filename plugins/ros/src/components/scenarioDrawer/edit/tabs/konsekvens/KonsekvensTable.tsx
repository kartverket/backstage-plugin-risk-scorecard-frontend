import React from 'react';
import { makeStyles, Radio, Theme, Typography } from '@material-ui/core';
import { pluginTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    display: 'flex',
    borderCollapse: 'collapse',
    width: '100%',
    justifyContent: 'flex-end',
    fontWeight: 'bold',
  },
  cell: {
    padding: '8px',
    border: '1px solid grey',
  },
  voidCell: {
    padding: '8px',
    border: '1px solid grey',
    color: theme.palette.type === 'dark' ? '#9E9E9E' : '#757575',
  },
  firstCell: {
    padding: '8px',
    border: 'none',
    width: 'fit-content',
    whiteSpace: 'nowrap',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    justifyContent: 'flex-end',
  },
}));

interface PickerTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const PickerTable = ({
  selectedValue,
  handleChange,
}: PickerTableProps) => {
  const { grid, firstCell, label, cell, voidCell } = useStyles();
  const { t } = useTranslationRef(pluginTranslationRef);

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  const tr = (row: number, cellType: string[]) => (
    <tr>
      <td className={firstCell}>
        <div className={label}>
          {/* @ts-ignore */}
          {t(`consequenceTable.rows.${row}`)} - {row}{' '}
          <Radio
            checked={selectedValue === row}
            onChange={handleChangeRow(row)}
          />
        </div>
      </td>
      <td className={cellType[0]}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.health.${row}`)}
      </td>
      <td className={cellType[1]}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.economical.${row}`)}
      </td>
      <td className={cellType[2]}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.privacy.${row}`)}
      </td>
      <td className={cellType[3]}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.reputation.${row}`)}
      </td>
    </tr>
  );

  return (
    <table className={grid}>
      <tbody>
        <tr>
          <td className={firstCell} />
          <td className={firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('consequenceTable.columns.health')}
            </Typography>
          </td>
          <td className={firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('consequenceTable.columns.economical')}
            </Typography>
          </td>
          <td className={firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('consequenceTable.columns.privacy')}
            </Typography>
          </td>
          <td className={firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('consequenceTable.columns.reputation')}
            </Typography>
          </td>
        </tr>
        {tr(5, [cell, cell, voidCell, voidCell])}
        {tr(4, [cell, cell, cell, voidCell])}
        {tr(3, [cell, cell, cell, cell])}
        {tr(2, [voidCell, cell, cell, cell])}
        {tr(1, [voidCell, cell, cell, cell])}
      </tbody>
    </table>
  );
};
