import React from 'react';
import { Radio, TableCell, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  grid: {
    borderCollapse: 'collapse',
  },
  cell: {
    padding: '8px',
    border: '1px solid grey',
  },
  firstCell: {
    padding: '8px',
    border: 'none',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
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
  const data = [
    [
      'Død eller varige alvorlige helsemssige konsekvenser',
      'Varig og alvorlig økonomisk tap',
      'N/A',
      'N/A',
    ],
    [
      'Varig eller alvorlig helsemessige konsekvenser',
      'Økonomisk tap av betydelig varighet for Kartverket og evt. tredejparter',
      'Retten til personvern krenkes på en svært alvorlig måte',
      'N/A',
    ],
    [
      'Midlertidig eller mindre alvorlige helsemessige konsekvenser',
      'Økonomisk tap av noe varighet',
      'Retten til personvern krenkes alvorlig i en lengre periode og involverer særlige kategorier/sårbare grupper',
      'Varig negativ oppmerksomhet i nasjonale og internasjonale medier som kan redusere tillit',
    ],
    [
      'N/A',
      'Forbigående økonomisk tap',
      'Retten til personvern krenkes i en lengre periode eller involverer særlige kategorier/sårbare grupper',
      'Negative saker i nasjonale medier som kan redusere tillit',
    ],
    [
      'N/A',
      'Forbigående mindre økonomisk tap',
      'Retten til personvern utfordres i en  svært kort periode og involverer ikke særlige kategorier/sårbare grupper',
      'Midlertidig omdømmetap og liten innvirkning på tillit',
    ],
  ];
  const tableHeader = [
    'Liv og helse',
    'Økonomisk',
    'Personvern',
    'Omdømme og tillitt',
  ];

  const classes = useStyles();

  const handleChangeRow = (rowIndex: number) => () => {
    handleChange(5 - rowIndex);
  };

  return (
    <>
      <Typography style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        Hvor alvorlig er den potensielle konsekvensen i det relevante området?
        Hvis konsekvensen er relevant for flere områder gjelder det høyeste
        konsekvensnivået.
      </Typography>
      <table className={classes.grid}>
        <tbody>
          <tr>
            <TableCell className={classes.firstCell} />
            {tableHeader.map((header, index) => (
              <TableCell key={index} className={classes.firstCell}>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                  {header}
                </Typography>
              </TableCell>
            ))}
          </tr>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <TableCell className={classes.firstCell}>
                <div className={classes.label}>
                  <Typography>{5 - rowIndex}</Typography>
                  <Radio
                    checked={selectedValue === 5 - rowIndex}
                    onChange={handleChangeRow(rowIndex)}
                  />
                </div>
              </TableCell>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={classes.cell}>
                  {cell}
                </TableCell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
