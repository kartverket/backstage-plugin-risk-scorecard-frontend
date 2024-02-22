import React, { ChangeEvent } from 'react';
import { Tiltak as ITiltak } from '../utils/interfaces';
import { Dropdown } from './Dropdown';
import schema from '../../ros_schema_no_v1_0.json';
import { TextField } from './Textfield';
import { FormLabel, Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import { useInputFieldStyles } from './style';

interface TiltakProps {
  tiltak: ITiltak;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
}

export const Tiltak = ({ tiltak, updateTiltak, deleteTiltak }: TiltakProps) => {
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
  const classes = useInputFieldStyles();

  return (
    <Grid container>
      <Grid item xs={8}>
        <TextField
          label="Tiltak"
          value={tiltak.beskrivelse}
          handleChange={setBeskrivelse}
          minRows={1}
        />
      </Grid>

      <Grid item xs={3}>
        <Dropdown
          label="Status"
          options={statusOptions}
          selectedValues={[tiltak.status]}
          handleChange={setStatus}
        />
      </Grid>

      <Grid
        item
        xs={1}
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '3rem',
        }}
      >
        <IconButton
          key="dismiss"
          title="Slett tiltaket"
          onClick={() => deleteTiltak(tiltak)}
          color="inherit"
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
      <Grid item xs={2}>
        <FormLabel className={classes.formLabel}> Frist </FormLabel>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nb}>
          <DatePicker value={tiltak.frist} onChange={setTiltaksfrist} />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
};
