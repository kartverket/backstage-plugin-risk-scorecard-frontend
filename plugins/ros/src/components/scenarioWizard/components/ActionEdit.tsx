import React from 'react';
import { Action } from '../../../utils/types';
import { Dropdown } from '../../common/Dropdown';
import { TextField } from '../../common/Textfield';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { actionStatusOptions } from '../../../utils/constants';
import { label } from '../../common/typography';

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

  const setActionField = (field: keyof Action, value: string) =>
    updateAction({ ...action, [field]: value });

  const validateUrl = (value: string) => {
    const urlRegex = /^https?:\/\/[a-z\d.-]+\.[a-z]{2,6}(\/[\w .-]*)*\/?$/;
    return urlRegex.test(value);
  };

  return (
    <Paper
      sx={{
        padding: 2,
        marginBottom: 2,
      }}
    >
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
          <Typography sx={label}>
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
            label={t('dictionary.title')}
            value={action.title}
            handleChange={value => setActionField('title', value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label={t('dictionary.description')}
            value={action.description}
            handleChange={value => setActionField('description', value)}
            errorMessage={t('scenarioDrawer.action.descriptionError')}
            errorKey={`${index}-action-description`}
            minRows={1}
            required
          />
        </Grid>

        <Grid item md={9} xs={12}>
          <TextField
            label={t('dictionary.url')}
            value={action.url}
            handleChange={value => setActionField('url', value)}
            validateInput={validateUrl}
            errorMessage={t('scenarioDrawer.action.urlError')}
            minRows={1}
            errorKey={`${index}-action-url`}
          />
        </Grid>

        <Grid
          item
          md={3}
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Dropdown<string>
            options={actionStatusOptions}
            selectedValues={action.status}
            handleChange={value => setActionField('status', value)}
            label={t('dictionary.status')}
            required
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
