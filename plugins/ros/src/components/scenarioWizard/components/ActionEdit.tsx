import React from 'react';
import { Action } from '../../utils/types';
import { Dropdown } from '../../utils/Dropdown';
import { TextField } from '../../utils/Textfield';
import { Button, Grid, Paper, Typography, useTheme } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as ADF } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { nb } from 'date-fns/locale/nb';
import FormControl from '@material-ui/core/FormControl';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { actionStatusOptions } from '../../utils/constants';
import { useFontStyles, useInputFieldStyles } from '../../utils/style';

interface ActionEditProps {
  action: Action;
  index: number;
  updateAction: (action: Action) => void;
  deleteAction: (action: Action) => void;
}

export const ActionEdit = ({
  action,
  index,
  updateAction,
  deleteAction,
}: ActionEditProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { paper, formControl } = useInputFieldStyles();
  const { label, labelSubtitle } = useFontStyles();
  const theme = useTheme();

  const setDescription = (description: string) =>
    updateAction({
      ...action,
      description: description,
    });

  const setStatus = (status: string) =>
    updateAction({
      ...action,
      status: status,
    });

  const setDeadline = (deadline: string | null) => {
    if (deadline) {
      const formattedDeadline = new Date(deadline).toISOString().split('T')[0];
      updateAction({
        ...action,
        deadline: formattedDeadline,
      });
    }
  };

  const setOwner = (owner: string) =>
    updateAction({
      ...action,
      owner: owner,
    });

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
            onClick={() => deleteAction(action)}
            color="primary"
          >
            {t('dictionary.delete')}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={t('dictionary.description')}
            value={action.description}
            handleChange={setDescription}
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
          <TextField value={action.owner} handleChange={setOwner} minRows={1} />
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
            selectedValues={action.status}
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
              <DatePicker
                value={action.deadline}
                onChange={setDeadline}
                sx={{
                  '.MuiInputBase-root': {
                    color: theme.palette.type === 'dark' ? 'white' : 'black',
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor:
                      theme.palette.type === 'dark' ? '#616161' : '#0000003b',
                  },
                  '.MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor:
                        theme.palette.type === 'dark' ? 'white' : 'black',
                    },
                  },
                  '.MuiIconButton-root': {
                    color: theme.palette.type === 'dark' ? 'white' : 'black',
                  },
                }}
              />
            </LocalizationProvider>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
