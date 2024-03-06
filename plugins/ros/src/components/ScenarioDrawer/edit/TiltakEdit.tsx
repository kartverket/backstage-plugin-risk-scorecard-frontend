import React from 'react';
import { Tiltak as ITiltak } from '../../utils/types';
import { Dropdown } from '../Dropdown';
import schema from '../../../ros_schema_no_v1_0.json';
import { TextField } from '../Textfield';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as ADF } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import { useFontStyles, useInputFieldStyles } from '../style';
import FormControl from '@material-ui/core/FormControl';

interface TiltakProps {
  tiltak: ITiltak;
  index: number;
  updateTiltak: (tiltak: ITiltak) => void;
  deleteTiltak: (tiltak: ITiltak) => void;
}

export const TiltakEdit = ({
  tiltak,
  index,
  updateTiltak,
  deleteTiltak,
}: TiltakProps) => {
  const statusOptions =
    schema.properties.scenarier.items.properties.tiltak.items.properties.status
      .enum;

  const setBeskrivelse = (beskrivelse: string) => {
    updateTiltak({
      ...tiltak,
      beskrivelse: beskrivelse,
    });
  };

  const setStatus = (status: string) => {
    updateTiltak({
      ...tiltak,
      status: status,
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

  const setTiltakseier = (tiltakseier: string) => {
    updateTiltak({
      ...tiltak,
      tiltakseier: tiltakseier,
    });
  };

  const { paper, formControl } = useInputFieldStyles();
  const { label, labelSubtitle, button } = useFontStyles();

  return (
    <Paper className={paper}>
      <Grid container>
        <Grid item xs={6} style={{ display: 'flex', alignItems: 'center' }}>
          <Typography className={label}>Tiltak {index}</Typography>
        </Grid>
        <Grid
          item
          xs={6}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            startIcon={<DeleteIcon />}
            key="dismiss"
            title="Slett tiltaket"
            onClick={() => deleteTiltak(tiltak)}
            color="primary"
            className={button}
          >
            Slett
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Beskrivelse"
            value={tiltak.beskrivelse}
            handleChange={setBeskrivelse}
            minRows={1}
          />
        </Grid>

        <Grid item xs={4}>
          <Typography className={label}>Tiltakseier</Typography>
          <Typography className={labelSubtitle}>
            De eller den som er ansvarlig for at tiltaket blir gjennomført
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography className={label} style={{ marginTop: '3rem' }}>
            Status
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography className={label} style={{ marginTop: '3rem' }}>
            Status
          </Typography>
        </Grid>

        <Grid item xs={4} style={{ marginTop: '-1.5rem' }}>
          <TextField
            value={tiltak.tiltakseier}
            handleChange={setTiltakseier}
            minRows={1}
          />
        </Grid>

        <Grid item xs={4} style={{ marginTop: '-1rem' }}>
          <Dropdown<string>
            options={statusOptions}
            selectedValues={tiltak.status}
            handleChange={setStatus}
          />
        </Grid>

        <Grid item xs={4} style={{ marginTop: '-1rem' }}>
          <FormControl className={formControl}>
            <LocalizationProvider dateAdapter={ADF} adapterLocale={nb}>
              <DatePicker value={tiltak.frist} onChange={setTiltaksfrist} />
            </LocalizationProvider>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
