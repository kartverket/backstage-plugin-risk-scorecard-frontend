import React, { ChangeEvent } from 'react';
import { Tiltak as ITiltak } from '../utils/types';
import { Dropdown } from './Dropdown';
import schema from '../../ros_schema_no_v1_0.json';
import { TextField } from './Textfield';
import { Button, FormLabel, Grid, Paper, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import { useInputFieldStyles } from './style';

interface TiltakProps {
  tiltak: ITiltak;
  index: number;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
}

export const Tiltak = ({
  tiltak,
  index,
  updateTiltak,
  deleteTiltak,
}: TiltakProps) => {
  const statusOptions =
    schema.properties.scenarier.items.properties.tiltak.items.properties.status
      .enum;

  const setBeskrivelse = (event: ChangeEvent<{ value: unknown }>) => {
    updateTiltak({
      ...tiltak,
      beskrivelse: event.target.value as string,
    });
  };

  const setStatus = (event: ChangeEvent<{ value: unknown }>) => {
    updateTiltak({
      ...tiltak,
      status: event.target.value as string,
    });
  };

  const setTiltaksfrist = (newValue: string | null) => {
    if (newValue) {
      const formattedDate = new Date(newValue).toISOString().split('T')[0];
      updateTiltak({
        ...tiltak,
        frist: formattedDate,
      });
    }
  };

  const setTiltakseier = (event: ChangeEvent<{ value: unknown }>) => {
    updateTiltak({
      ...tiltak,
      tiltakseier: event.target.value as string,
    });
  };

  const classes = useInputFieldStyles();

  return (
    <Paper
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#333333',
      }}
    >
      <Grid container>
        <Grid item xs={10}>
          <Typography variant="h6" style={{ color: 'white' }}>
            Tiltak {index}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            startIcon={<DeleteIcon />}
            key="dismiss"
            title="Slett tiltaket"
            onClick={() => deleteTiltak(tiltak)}
            color="primary"
          >
            Slett
          </Button>
        </Grid>
        <Grid item xs={8}>
          <TextField
            label="Beskrivelse"
            value={tiltak.beskrivelse}
            handleChange={setBeskrivelse}
            minRows={1}
          />
        </Grid>

        <Grid item xs={4}>
          <Dropdown
            label="Status"
            options={statusOptions}
            selectedValues={[tiltak.status]}
            handleChange={setStatus}
          />
        </Grid>

        <Grid item xs={8}>
          <TextField
            label="Tiltakseier"
            value={tiltak.tiltakseier}
            handleChange={setTiltakseier}
            minRows={1}
          />
        </Grid>

        <Grid
          item
          xs={4}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '1.5em',
          }}
        >
          <FormLabel className={classes.formLabel}> Frist </FormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nb}>
            <DatePicker value={tiltak.frist} onChange={setTiltaksfrist} />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Paper>
  );
};
