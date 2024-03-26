import React from 'react';
import { Radio, makeStyles } from '@material-ui/core';

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

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  return (
    <table className={classes.grid}>
      <tbody>
        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Veldig stor - 5</b>
              <Radio
                checked={selectedValue === 5}
                onChange={handleChangeRow(5)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Scenarioet er nesten garantert å intreffe. Det kan intreffe nærmest
            daglig.
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Stor - 4</b>
              <Radio
                checked={selectedValue === 4}
                onChange={handleChangeRow(4)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Scenarioet vil med stor sannsynlighet inntreffe. Det kan inntreffe
            nærmest ukentlig.
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Moderat - 3</b>
              <Radio
                checked={selectedValue === 3}
                onChange={handleChangeRow(3)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Scenarioet kan inntreffe. Det kan inntreffe nærmest årlig.
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Liten - 2</b>
              <Radio
                checked={selectedValue === 2}
                onChange={handleChangeRow(2)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Scenarioet er lite sannsynlig å inntreffe. Det kan inntreffe hvert
            10. år.
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Svært liten - 1</b>
              <Radio
                checked={selectedValue === 1}
                onChange={handleChangeRow(1)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Scenarioet er usannsynlig å inntreffe. Det inntreffer sjeldnere enn
            hvert 10. år
          </td>
        </tr>
      </tbody>
    </table>
  );
};
