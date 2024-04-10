import React from 'react';
import { makeStyles, Radio } from '@material-ui/core';
import { pluginTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    borderCollapse: 'collapse',
    width: '100%',
    justifyContent: 'center',
    paddingTop: '2rem',
  },
  cell: {
    padding: '8px',
    border: '1px solid grey',
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
    fontWeight: 'bold',
  },
});

interface SannsynlighetTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const SannsynlighetTable = ({
  selectedValue,
  handleChange,
}: SannsynlighetTableProps) => {
  const classes = useStyles();
  const { t } = useTranslationRef(pluginTranslationRef);

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  const tr = (row: number) => (
    <tr>
      <td className={classes.firstCell}>
        <div className={classes.label}>
          {/* @ts-ignore */}
          {t(`probabilityTable.rows.${row}`)} - {row}
          <Radio
            checked={selectedValue === row}
            onChange={handleChangeRow(row)}
          />
        </div>
      </td>
      <td className={classes.cell}>
        {/* @ts-ignore */}
        {t(`probabilityTable.cells.${row}`)}
      </td>
    </tr>
  );

  return (
    <table className={classes.grid}>
      <tbody>
        {tr(5)}
        {tr(4)}
        {tr(3)}
        {tr(2)}
        {tr(1)}
      </tbody>
    </table>
  );
};
