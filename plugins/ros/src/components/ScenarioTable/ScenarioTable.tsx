import React, { useContext } from 'react';
import { Button, Paper, Typography } from '@material-ui/core';
import { ROS } from '../utils/types';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { ScenarioTableRow } from './ScenarioTableRow';
import AddCircle from '@material-ui/icons/AddCircle';
import { ScenarioContext } from '../ROSPlugin/ScenarioContext';
import { useTableStyles } from './ScenarioTableStyles';

interface ScenarioTableProps {
  ros: ROS;
}

export const ScenarioTable = ({ ros }: ScenarioTableProps) => {
  const { newScenario, openScenario } = useContext(ScenarioContext)!!;
  const { titleBackground } = useTableStyles();

  return (
    <>
      <Paper
        className={titleBackground}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderRadius: '4px 4px 0px 0px',
        }}
      >
        <Typography variant="h5" style={{ padding: '1rem' }}>
          Risikoscenarioer
        </Typography>

        <Button
          startIcon={<AddCircle />}
          variant="text"
          color="primary"
          onClick={newScenario}
          style={{
            display: 'flex',
            padding: '1rem',
            justifyContent: 'flex-end',
          }}
        >
          Legg til scenario
        </Button>
      </Paper>
      <TableContainer
        component={Paper}
        style={{ borderRadius: '0px 0px 4px 4px' }}
      >
        <Table
          style={{
            backgroundColor: '#424242',
          }}
        >
          <TableHead>
            <TableRow
              style={{
                display: 'flex',
                borderBottom: '1px solid #616161',
                borderTop: '1px solid #616161',
                alignItems: 'center',
              }}
            >
              <TableCell
                style={{
                  display: 'flex',
                  width: '40%',
                  paddingTop: '0.1rem',
                  paddingBottom: '0.1rem',
                }}
              >
                <Typography variant="subtitle1">
                  <b>TITTEL </b>
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  display: 'flex',
                  width: '20%',
                  paddingTop: '0.1rem',
                  paddingBottom: '0.1rem',
                }}
              >
                <Typography variant="subtitle1">
                  <b>DAGENS RISIKO</b>
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  display: 'flex',
                  width: '20%',
                  paddingTop: '0.1rem',
                  paddingBottom: '0.1rem',
                }}
              >
                <Typography variant="subtitle1">
                  <b>RESTRISIKO</b>
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  display: 'flex',
                  width: '20%',
                  paddingTop: '0.1rem',
                  paddingBottom: '0.1rem',
                }}
              >
                <Typography variant="subtitle1">
                  <b>ANTALL TILTAK</b>
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ros.scenarier.map(scenario => (
              <ScenarioTableRow
                key={scenario.ID}
                scenario={scenario}
                viewRow={openScenario}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
