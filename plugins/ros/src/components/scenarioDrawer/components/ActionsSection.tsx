import { Fragment, useEffect, useState } from 'react';
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
import Switch from '@mui/material/Switch';
import { useActionFiltersStorage } from '../../../stores/ActionFiltersStore.ts';
import { Text } from '@backstage/ui';
import { useSortActionsByRelevance } from '../../../hooks/UseSortActionsByRelevance.ts';
import { filterActionsByRelevance } from '../../../utils/actions.ts';
import { ActionRowList } from '../../action/ActionRowList.tsx';

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

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
};

export function ActionsSection({ formMethods, isEditing }: ActionSectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario } = useScenario();

  const { watch } = formMethods;
  const currentActions = watch('actions');

  const [sortedActions, setSortedActions] = useState<Action[] | undefined>(
    undefined,
  );
  const { actionFilters, saveOnlyRelevantFilter } = useActionFiltersStorage();
  const sortActionsByRelevance = useSortActionsByRelevance();

  useEffect(() => {
    setSortedActions(sortedActionsState => {
      if (sortedActionsState === undefined)
        return sortActionsByRelevance([...currentActions]);

      // sync actions
      const updatedSortedActions: Action[] = [];
      for (const action of sortedActionsState) {
        const updatedAction = currentActions.find(a => a.ID === action.ID);
        if (updatedAction) updatedSortedActions.push(updatedAction);
      }
      // add new actions
      for (const action of currentActions) {
        if (!updatedSortedActions.some(a => a.ID === action.ID)) {
          updatedSortedActions.push(action);
        }
      }
      return updatedSortedActions;
    });
  }, [currentActions, actionFilters, sortActionsByRelevance]);

  if (isEditing) {
    return <ActionsSectionOnEdit formMethods={formMethods} />;
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
      {sortedActions !== undefined && sortedActions.length > 0 ? (
        <ActionRowList
          scenario={scenario}
          displayedActions={filterActionsByRelevance(
            sortedActions,
            actionFilters.showOnlyRelevant,
          )}
        />
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

type ActionsSectionOnEditProps = {
  formMethods: UseFormReturn<FormScenario>;
};

function ActionsSectionOnEdit(props: ActionsSectionOnEditProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control } = props.formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

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
            formMethods={props.formMethods}
            displayedIndex={index}
            handleDelete={() => remove(index)}
            baseObjectPathToActionOfForm={`actions.${index}`}
          />
        </Fragment>
      ))}
    </Paper>
  );
}
