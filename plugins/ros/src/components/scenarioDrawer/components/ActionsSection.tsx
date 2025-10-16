import { ActionBox } from './ActionBox';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { emptyAction, useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import Divider from '@mui/material/Divider';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Action, FormScenario } from '../../../utils/types';
import { ActionFormItem } from './ActionFormItem';
import Button from '@mui/material/Button';
import { AddCircle } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { ActionStatusOptions } from '../../../utils/constants';
import Switch from '@mui/material/Switch';
import { useActionFiltersStorage } from '../../../stores/ActionFiltersStore.ts';
import { Text } from '@backstage/ui';

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
  onSubmit: () => void;
  setCurrentUpdatedActionIDs: React.Dispatch<React.SetStateAction<string[]>>;
};

export function ActionsSection({
  formMethods,
  isEditing,
  onSubmit,
  setCurrentUpdatedActionIDs,
}: ActionSectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isDrawerOpen } = useScenario();

  const { control, watch } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const currentActions = watch('actions');

  const { actionFilters, saveOnlyRelevantFilter } = useActionFiltersStorage();
  const [processedActions, setProcessedActions] = useState<
    { action: Action; originalIndex: number }[]
  >([]);

  const sortActionsByRelevance = useCallback((actions: Action[]) => {
    return [...actions].sort((a, b) => {
      const aIsNotRelevant = a.status === ActionStatusOptions.NotRelevant;
      const bIsNotRelevant = b.status === ActionStatusOptions.NotRelevant;

      if (aIsNotRelevant && !bIsNotRelevant) {
        return 1;
      }
      if (!aIsNotRelevant && bIsNotRelevant) {
        return -1;
      }
      return 0;
    });
  }, []);

  useEffect(() => {
    if (isDrawerOpen && currentActions?.length) {
      const sorted = sortActionsByRelevance(currentActions);

      setProcessedActions(
        sorted.map(action => ({
          action,
          originalIndex: currentActions.findIndex(a => a.ID === action.ID),
        })),
      );
    }
    // ESLint-ignore: only sort when drawer opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, sortActionsByRelevance]);

  useEffect(() => {
    if (isDrawerOpen && processedActions.length) {
      setProcessedActions(prev =>
        prev.map(({ action, originalIndex }) => {
          const updated = currentActions.find(a => a.ID === action.ID);
          return updated
            ? { action: updated, originalIndex }
            : { action, originalIndex };
        }),
      );
    }
  }, [isDrawerOpen, currentActions, processedActions.length]);

  const visibleActions = processedActions.filter(({ action }) =>
    actionFilters.showOnlyRelevant
      ? action.status !== ActionStatusOptions.NotRelevant
      : true,
  );

  if (isEditing) {
    return (
      <Paper sx={section}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Text variant="title-x-small" weight="bold">
            {t('dictionary.measure')}
          </Text>
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Text variant="title-x-small" weight="bold">
          {t('dictionary.measures')}
        </Text>

        <RelevanceToggle
          checked={actionFilters.showOnlyRelevant}
          onChange={value => saveOnlyRelevantFilter(value)}
        />
      </Box>
      {visibleActions.length > 0 ? (
        visibleActions.map(({ action, originalIndex }) => (
          <Fragment key={action.ID}>
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
        <Text variant="body-large" style={{ fontStyle: 'italic' }}>
          {!currentActions || currentActions.length === 0
            ? t('dictionary.emptyField', {
                field: t('dictionary.measures').toLowerCase(),
              })
            : t('dictionary.noRelevantMeasures')}
        </Text>
      )}
    </Paper>
  );
}

const RelevanceToggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Switch
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        name="showOnlyRelevant"
        color="primary"
      />
      <Text variant="body-medium">{t('dictionary.showOnlyRelevant')}</Text>
    </Box>
  );
};
