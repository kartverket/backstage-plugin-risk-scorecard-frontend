import React from 'react';
import { Tiltak as ITiltak } from '../../../../utils/types';
import { Dropdown } from '../../../../utils/Dropdown';
import schema from '../../../../../ros_schema_no_v1_0.json';
import { TextField } from '../../../../utils/Textfield';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as ADF } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import { useFontStyles, useInputFieldStyles } from '../../../style';
import FormControl from '@material-ui/core/FormControl';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

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
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Paper className={paper}>
      <Grid container style={{ display: 'flex', rowGap: '0.7rem' }}>
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>

          <Button
            startIcon={<DeleteIcon />}
            key="dismiss"
            title="Slett tiltaket"
            onClick={() => deleteTiltak(tiltak)}
            color="primary"
            className={button}
          >
            {t('dictionary.delete')}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={t('dictionary.description')}
            value={tiltak.beskrivelse}
            handleChange={setBeskrivelse}
            minRows={1}
          />
        </Grid>

        <Grid
          item
          md={6}
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography className={label}>
            {t('dictionary.measureOwner')}
          </Typography>
          <Typography className={labelSubtitle}>
            {t('scenarioDrawer.measureTab.measureOwnerDescription')}
          </Typography>
          <TextField
            value={tiltak.tiltakseier}
            handleChange={setTiltakseier}
            minRows={1}
          />
        </Grid>

        <Grid
          item
          md={3}
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Typography className={label}>{t('dictionary.status')}</Typography>
          <Dropdown<string>
            options={statusOptions}
            selectedValues={tiltak.status}
            handleChange={setStatus}
          />
        </Grid>

        <Grid
          item
          md={3}
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Typography className={label}>{t('dictionary.deadline')}</Typography>
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
