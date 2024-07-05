import React from 'react';
import { Action } from '../../../utils/types';
import { Dropdown } from '../../common/Dropdown';
import { TextField } from '../../common/Textfield';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { actionStatusOptions } from '../../../utils/constants';
import { useFontStyles, useInputFieldStyles } from '../../../utils/style';

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
  const { paper } = useInputFieldStyles();
  const { label } = useFontStyles();

  const setActionField = (field: keyof Action, value: string) =>
    updateAction({ ...action, [field]: value });

  const validateUrl = (value: string) => {
    const urlRegex = /^https?:\/\/[a-z\d.-]+\.[a-z]{2,6}(\/[\w .-]*)*\/?$/;
    return urlRegex.test(value);
  };

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
