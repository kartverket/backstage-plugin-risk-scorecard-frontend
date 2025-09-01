import { ActionBox } from './ActionBox';
import { Fragment, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { emptyAction, useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { emptyState, heading3 } from '../../common/typography';
import Divider from '@mui/material/Divider';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { ActionFormItem } from './ActionFormItem';
import Button from '@mui/material/Button';
import { AddCircle } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { ActionStatusOptions } from '../../../utils/constants';
import { useDebounce } from '../../../utils/hooks';

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
  onSubmit: () => void;
};

export function ActionsSection({
  formMethods,
  isEditing,
  onSubmit,
}: ActionSectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control, watch } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const currentActions = watch('actions');

  const sortedActionsWithIndex = useMemo(() => {
    if (!currentActions || currentActions.length === 0) return [];

    return currentActions
      .map((action, originalIndex) => ({ action, originalIndex }))
      .sort((a, b) => {
        if (
          a.action.status === ActionStatusOptions.NotRelevant &&
          b.action.status !== ActionStatusOptions.NotRelevant
        ) {
          return 1;
        }
        if (
          b.action.status === ActionStatusOptions.NotRelevant &&
          a.action.status !== ActionStatusOptions.NotRelevant
        ) {
          return -1;
        }
        return 0;
      });
  }, [currentActions]);

  const [currentUpdatedActionIDs, setCurrentUpdatedActionIDs] = useState<
    string[]
  >([]);

  const { submitEditedScenarioToRiSc, scenario } = useScenario();

  useDebounce(currentUpdatedActionIDs, 6000, updatedIDs => {
    if (updatedIDs.length === 0) return;
    const updatedScenario = {
      ...scenario,
      actions: scenario.actions.map(a =>
        updatedIDs.find(id => id === a.ID)
          ? { ...a, lastUpdated: new Date() }
          : a,
      ),
    };
    submitEditedScenarioToRiSc(updatedScenario);
    setCurrentUpdatedActionIDs([]);
  });

  if (isEditing) {
    return (
      <Paper sx={section}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={heading3}>{t('dictionary.measure')}</Typography>
          <Button
            startIcon={<AddCircle />}
            color="primary"
            onClick={() => append(emptyAction())}
          >
            {t('scenarioDrawer.measureTab.addMeasureButton')}
          </Button>
        </Box>
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
      </Paper>
    );
  }

  return (
    <Paper sx={section}>
      <Typography sx={heading3}>{t('dictionary.measures')}</Typography>

      {sortedActionsWithIndex.length > 0 ? (
        sortedActionsWithIndex.map(({ action, originalIndex }) => (
          <Fragment key={fields[originalIndex].id}>
            <Divider />
            <ActionBox
              action={action}
              index={originalIndex}
              formMethods={formMethods}
              remove={remove}
              onSubmit={onSubmit}
              setCurrentUpdatedActionIDs={setCurrentUpdatedActionIDs}
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
}
