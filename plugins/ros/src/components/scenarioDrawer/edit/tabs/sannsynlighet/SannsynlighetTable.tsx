import React from 'react';
import { makeStyles, Radio } from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
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
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  const radioCell = (row: number) => (
    <td className={classes.firstCell}>
      <Radio checked={selectedValue === row} onChange={handleChangeRow(row)} />
      {/* @ts-ignore */}
      {row}: {t(`probabilityTable.rows.${row}`)}
    </td>
  );

  const contentCell = (row: number) => (
    <td className={classes.cell}>
      {/* @ts-ignore */}
      {t(`probabilityTable.cells.${row}`)}
    </td>
  );

  return (
    <table className={classes.grid}>
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
