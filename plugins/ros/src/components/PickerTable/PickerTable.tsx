import React from 'react';
import { Radio, TableCell, makeStyles } from '@material-ui/core';

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
      'Varig og alvorlig økonomisk tap',
      'Retten til personvern krenkes på en svært alvorlig måte',
      'Død eller varige alvorlige helsemssige konsekvenser',
      'Den registrerte og samfunnet taper tilliten til Kartverket',
      'Varig og alvorlig tap av omdømme',
    ],
    [
      'Økonomisk tap av betydelig varighet',
      'Retten til personvern krenkes alvorlig i en lengre periode og involverer særlige kategorier/sårbare grupper',
      'Varig eller alvorlig helsemessige konsekvenser',
      'Den registrerte taper tilliten til kartverket',
      'Varig eller alvorlig tap av omdømme',
    ],
    [
      'Økonomisk tap av noe varighet',
      'Retten til personvern krenkes i en lengre persiode eller involverer særlige kategorier/sårbare grupper',
      'Midlertidig eller noe mer alvorlige helsemessige konsekvenser for den registrerte',
      'Den registrertes tillit til Kartverket utfordres',
      'Midlertidig eller noe mer alvorlig tap av omdømme',
    ],
    [
      'Forbigående økonomisk tap',
      'Retten til personvern utfordres i en kort periode elller uten å involvere særlige kateogier/sårbare grupper',
      'Midlertidig eller mindre alvorlige helsemessige konsekvenser for den registrerte.',
      'Den registrertes tillit til Kartverket utfordres midlertidig',
      'Midlertidig eller begrenset tap av omdømme',
    ],
    [
      'Forbigående mindre økonomisk tap',
      'Retten til personvern utfordres i en svært kort periode elller uten å involvere særlige kateogier/sårbare grupper',
      'Midlertidig eller mindre helsemessige konsekvenser for den registrerte',
      'Den registrertes tillit til Kartverket utfordres i en kort periode',
      'Midlertidig og begrenset tap av omdømme',
    ],
  ];
  const tableHeader = [
    'Økonomisk',
    'Personvern',
    'Liv og helse',
    'Tillit',
    'Omdømme',
  ];

  const classes = useStyles();

  const handleChangeRow = (rowIndex: number) => () => {
    handleChange(5 - rowIndex);
  };

  return (
    <table className={classes.grid}>
      <tbody>
        <tr>
          <TableCell className={classes.firstCell} />
          {tableHeader.map((header, index) => (
            <TableCell key={index} className={classes.firstCell}>
              {header}
            </TableCell>
          ))}
        </tr>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <TableCell className={classes.firstCell}>
              <div className={classes.label}>
                <span>{5 - rowIndex}</span>
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
  );
};
