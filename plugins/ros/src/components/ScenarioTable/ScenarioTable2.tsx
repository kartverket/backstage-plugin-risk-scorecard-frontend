import React, { useState } from 'react';
import {
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
} from '@material-ui/core';
import { ROS, Scenario } from '../interface/interfaces';
import { DeleteButton, EditButton } from './ScenarioTableButtons';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { InfoCard } from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import TableRow from '@mui/material/TableRow';

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
    const [open, setOpen] = useState(true);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{scenario.beskrivelse}</TableCell>
          <TableCell align="center">{scenario.risiko.konsekvens}</TableCell>
          <TableCell align="center">{scenario.risiko.sannsynlighet}</TableCell>
          <TableCell>
            <EditButton onClick={() => editRow(scenario.ID)} />
            <DeleteButton onClick={() => deleteRow(scenario.ID)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Grid container style={{ padding: '1rem' }}>
                <Grid item xs={6}>
                  <Typography variant="h6">Trusselaktører</Typography>
                  <Box>{scenario.trusselaktører.join(', ')}</Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Tiltak</Typography>
                  <TableContainer>
                    <TableHead>
                      <TableRow>
                        <TableCell>Beskrivelse</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scenario.tiltak.map(tiltak => (
                        <TableRow>
                          <TableCell>{tiltak.beskrivelse}</TableCell>
                          <TableCell>{tiltak.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableContainer>
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
      <Typography variant="h3" style={{ paddingBottom: '1rem' }}>
        Scenarioer
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow
              style={{
                borderBottom: '1px solid #ffffff',
                borderTop: '1px solid #ffffff',
              }}
            >
              <TableCell />
              <TableCell style={{ fontWeight: 'bold' }}>Beskrivelse</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>
                Konsekvens
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>
                Sannsynlighet
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
