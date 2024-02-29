import React, { Fragment, useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Collapse, Grid, IconButton, Typography } from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { DeleteButton, EditButton } from './ScenarioTableButtons';
import { konsekvensOptions, sannsynlighetOptions } from '../utils/constants';
import { Scenario } from '../utils/types';

interface ScenarioTableRowProps {
  scenario: Scenario;
  editRow: (id: string) => void;
  deleteRow: (id: string) => void;
}

export const ScenarioTableRow = ({
  scenario,
  editRow,
  deleteRow,
}: ScenarioTableRowProps) => {
  const [open, setOpen] = useState(false);

  const sannsynlighet =
    sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1;
  const konsekvens = konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1;

  return (
    <Fragment>
      <TableRow style={{ backgroundColor: 'transparent' }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="medium"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell>{scenario.tittel}</TableCell>

        <TableCell>
          S:{sannsynlighet} K:{konsekvens}
        </TableCell>

        <TableCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <EditButton onClick={() => editRow(scenario.ID)} />
          <DeleteButton onClick={() => deleteRow(scenario.ID)} />
        </TableCell>
      </TableRow>
      <CollapsedRow scenario={scenario} open={open} />
    </Fragment>
  );
};

const CollapsedRow = ({
  scenario,
  open,
}: {
  scenario: Scenario;
  open: boolean;
}) => (
  <TableRow
    style={{
      borderBottom: '1px solid white',
      backgroundColor: 'transparent',
    }}
  >
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
              <ul>
                {scenario.trusselaktører.map(t => (
                  <li>{t}</li>
                ))}
              </ul>
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <b>Sårbarheter: </b>
              <ul>
                {scenario.sårbarheter.map(s => (
                  <li>{s}</li>
                ))}
              </ul>
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
                    {tiltak.beskrivelse} - {tiltak.status}
                  </Typography>
                </li>
              ))}
            </ul>
          </Grid>
        </Grid>
      </Collapse>
    </TableCell>
  </TableRow>
);
