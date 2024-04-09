import React, { useContext } from 'react';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import { ROS } from '../utils/types';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { ScenarioTableRow } from './ScenarioTableRow';
import AddCircle from '@material-ui/icons/AddCircle';
import { ScenarioContext } from '../rosPlugin/ScenarioContext';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useTableStyles } from './ScenarioTableStyles';

interface ScenarioTableProps {
  ros: ROS;
}

export const ScenarioTable = ({ ros }: ScenarioTableProps) => {
  const { newScenario, openScenario } = useContext(ScenarioContext)!!;
  const { titleBox, rowBorder } = useTableStyles();

  return (
    <>
      <Paper>
        <Box className={titleBox}>
          <Typography variant="h5" style={{ padding: '1rem' }}>
            Risikoscenarioer
          </Typography>

          {ros.scenarier.length > 0 && (
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
              Legg til risikoscenario
            </Button>
          )}
        </Box>
        {ros.scenarier.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <Button
              startIcon={<AddCircleOutlineIcon />}
              variant="contained"
              color="primary"
              onClick={newScenario}
              style={{
                display: 'flex',
                padding: '0.5rem 1rem 0.5rem 1rem',
                justifyContent: 'center',
              }}
            >
              Legg til risikoscenario
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className={rowBorder}>
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
                      <b>STARTRISIKO</b>
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
        )}
      </Paper>
    </>
  );
};
