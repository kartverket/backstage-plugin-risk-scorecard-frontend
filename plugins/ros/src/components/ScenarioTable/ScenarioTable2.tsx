import React, { useState } from 'react';
import {
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import { ROS, Scenario } from '../interface/interfaces';
import { DeleteButton, EditButton } from './ScenarioTableButtons';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { InfoCard } from '@backstage/core-components';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';

interface ScenarioTableProps {
  ros: ROS;
  deleteRow: (id: number) => void;
  editRow: (id: number) => void;
}

export const ScenarioTable = ({
  ros,
  deleteRow,
  editRow,
}: ScenarioTableProps) => {
  const Row = ({ scenario }: { scenario: Scenario }) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow>
          <TableCell style={{ width: '5rem' }}>
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{scenario.beskrivelse}</TableCell>
          <TableCell>{scenario.risiko.konsekvens}</TableCell>
          <TableCell>{scenario.risiko.sannsynlighet}</TableCell>
          <TableCell>
            <EditButton onClick={() => editRow(scenario.ID)} />
            <DeleteButton onClick={() => deleteRow(scenario.ID)} />
          </TableCell>
        </TableRow>
        <TableRow style={{ borderBottom: '1px solid white' }}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Grid container style={{ padding: '1rem' }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <b>Beskrivelse: </b>
                    {scenario.beskrivelse}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <b>Trusselaktører: </b>
                    {scenario.trusselaktører.join(', ')}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <b>Sårbarheter: </b>
                    {scenario.sårbarheter.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    <b>Tiltak:</b>
                  </Typography>
                  <ul>
                    {scenario.tiltak.map(tiltak => (
                      <li>
                        <Typography variant="body1">
                          {tiltak.beskrivelse}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <InfoCard>
      <Typography variant="h3" gutterBottom>
        Scenarioer
      </Typography>
      <TableContainer component={Paper}>
        <Table
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <TableHead>
            <TableRow
              style={{
                borderBottom: '1px solid white',
                borderTop: '1px solid white',
              }}
            >
              <TableCell />
              <TableCell
                style={{ paddingTop: '0.1rem', paddingBottom: '0.1rem' }}
              >
                <Typography variant="h6">Beskrivelse</Typography>
              </TableCell>
              <TableCell
                style={{ paddingTop: '0.1rem', paddingBottom: '0.1rem' }}
              >
                <Typography variant="h6">Konsekvens</Typography>
              </TableCell>
              <TableCell
                style={{ paddingTop: '0.1rem', paddingBottom: '0.1rem' }}
              >
                <Typography variant="h6">Sannsynlighet</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {ros.scenarier.map(scenario => (
              <Row key={scenario.ID} scenario={scenario} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </InfoCard>
  );
};
