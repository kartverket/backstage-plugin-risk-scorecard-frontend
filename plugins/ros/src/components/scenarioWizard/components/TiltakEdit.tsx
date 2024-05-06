import React from 'react';
import { Action as ITiltak } from '../../utils/types';
import { Dropdown } from '../../utils/Dropdown';
import { TextField } from '../../utils/Textfield';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as ADF } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import { useFontStyles, useInputFieldStyles } from '../../scenarioDrawer/style';
import FormControl from '@material-ui/core/FormControl';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { actionStatusOptions } from '../../utils/constants';

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
  const setBeskrivelse = (beskrivelse: string) => {
    updateTiltak({
      ...tiltak,
      description: beskrivelse,
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
        deadline: formattedDate,
      });
    }
  };

  const setTiltakseier = (tiltakseier: string) => {
    updateTiltak({
      ...tiltak,
      owner: tiltakseier,
    });
  };

  const { paper, formControl } = useInputFieldStyles();
  const { label, labelSubtitle } = useFontStyles();
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
          >
            {t('dictionary.delete')}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={t('dictionary.description')}
            value={tiltak.description}
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
            value={tiltak.owner}
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
            options={actionStatusOptions}
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
              <DatePicker value={tiltak.deadline} onChange={setTiltaksfrist} />
            </LocalizationProvider>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
