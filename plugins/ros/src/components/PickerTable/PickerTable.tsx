import React from 'react';
import { Radio, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    borderCollapse: 'collapse',
    width: '100%',
    justifyContent: 'flex-end',
  },
  cell: {
    padding: '8px',
    border: '1px solid grey',
  },
  voidCell: {
    padding: '8px',
    border: '1px solid grey',
    color: '#9E9E9E',
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

interface PickerTableProps {
  selectedValue: number;
  handleChange: (index: number) => void;
}

export const PickerTable = ({
  selectedValue,
  handleChange,
}: PickerTableProps) => {
  const classes = useStyles();

  const handleChangeRow = (row: number) => () => {
    handleChange(row);
  };

  return (
    <table className={classes.grid}>
      <tbody>
        <tr>
          <td className={classes.firstCell} />
          <td className={classes.firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Liv og helse
            </Typography>
          </td>
          <td className={classes.firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Økonomisk
            </Typography>
          </td>
          <td className={classes.firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Personvern
            </Typography>
          </td>
          <td className={classes.firstCell}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Omdømme og tillit
            </Typography>
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Kritisk - 5 </b>
              <Radio
                checked={selectedValue === 5}
                onChange={handleChangeRow(5)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Død eller varige alvorlige helsemssige konsekvenser
          </td>
          <td className={classes.cell}>Varig og alvorlig økonomisk tap</td>
          <td className={classes.voidCell}>
            Personvern kan ikke være mer alvorlig enn 4
          </td>
          <td className={classes.voidCell}>
            Omdømme og tillit kan ikke være mer alvorlig enn 3
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Alvorlig - 4 </b>
              <Radio
                checked={selectedValue === 4}
                onChange={handleChangeRow(4)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Varig eller alvorlig helsemessige konsekvenser
          </td>
          <td className={classes.cell}>
            Økonomisk tap av betydelig varighet for Kartverket og evt.
            tredjeparter
          </td>
          <td className={classes.cell}>
            Retten til personvern krenkes på en svært alvorlig måte
          </td>
          <td className={classes.voidCell}>
            Omdømme og tillit kan ikke være mer alvorlig enn 3
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Moderat - 3 </b>
              <Radio
                checked={selectedValue === 3}
                onChange={handleChangeRow(3)}
              />
            </div>
          </td>
          <td className={classes.cell}>
            Midlertidig eller mindre alvorlige helsemessige konsekvenser
          </td>
          <td className={classes.cell}>Økonomisk tap av noe varighet</td>
          <td className={classes.cell}>
            Retten til personvern krenkes alvorlig i en lengre periode og
            involverer særlige kategorier/sårbare grupper
          </td>
          <td className={classes.cell}>
            Varig negativ oppmerksomhet i nasjonale og internasjonale medier som
            kan redusere tillit
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Liten - 2 </b>
              <Radio
                checked={selectedValue === 2}
                onChange={handleChangeRow(2)}
              />
            </div>
          </td>
          <td className={classes.voidCell}>
            Liv og helse kan ikke være mindre alvorlig enn 3
          </td>
          <td className={classes.cell}>Forbigående økonomisk tap</td>
          <td className={classes.cell}>
            Retten til personvern krenkes i en lengre periode eller involverer
            særlige kategorier/sårbare grupper
          </td>
          <td className={classes.cell}>
            Negative saker i nasjonale medier som kan redusere tillit
          </td>
        </tr>

        <tr>
          <td className={classes.firstCell}>
            <div className={classes.label}>
              <b> Ubetydelig - 1 </b>
              <Radio
                checked={selectedValue === 1}
                onChange={handleChangeRow(1)}
              />
            </div>
          </td>
          <td className={classes.voidCell}>
            Liv og helse kan ikke være mindre alvorlig enn 3
          </td>
          <td className={classes.cell}>Forbigående mindre økonomisk tap</td>
          <td className={classes.cell}>
            Retten til personvern utfordres i en svært kort periode og
            involverer ikke særlige kategorier/sårbare grupper
          </td>
          <td className={classes.cell}>
            Midlertidig omdømmetap og liten innvirkning på tillit
          </td>
        </tr>
      </tbody>
    </table>
  );
};
