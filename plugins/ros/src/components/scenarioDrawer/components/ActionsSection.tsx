import { ActionBox } from './ActionBox';
import React, { Fragment } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { emptyAction } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { emptyState, heading3 } from '../../common/typography';
import Divider from '@mui/material/Divider';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { ActionFormItem } from './ActionFormItem';
import Button from '@mui/material/Button';
import { AddCircle } from '@mui/icons-material';

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
  onSubmit: () => void;
};

export const ActionsSection = ({
  formMethods,
  isEditing,
  onSubmit,
}: ActionSectionProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control, watch } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const currentActions = watch('actions');

  if (isEditing) {
    return (
      <Paper sx={section}>
        <Typography sx={heading3}>{t('dictionary.measure')}</Typography>
        {fields.map((field, index) => (
          <Fragment key={field.id}>
            <Divider variant="fullWidth" />
            <ActionFormItem
              key={index}
              formMethods={formMethods}
              index={index}
              remove={remove}
            />
          </Fragment>
        ))}
        <Button
          startIcon={<AddCircle />}
          color="primary"
          onClick={() => append(emptyAction())}
        >
          {t('scenarioDrawer.measureTab.addMeasureButton')}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('dictionary.measures')}</Typography>

      {fields.length > 0 ? (
        fields.map((field, index) => (
          <Fragment key={field.id}>
            <Divider />
            <ActionBox
              action={currentActions[index]}
              index={index}
              formMethods={formMethods}
              remove={remove}
              onSubmit={onSubmit}
            />
          </Fragment>
        ))
      ) : (
        <Typography sx={emptyState}>
          {t('dictionary.emptyField', {
            field: t('dictionary.measures').toLowerCase(),
          })}
        </Typography>
      )}
    </Paper>
  );
};
