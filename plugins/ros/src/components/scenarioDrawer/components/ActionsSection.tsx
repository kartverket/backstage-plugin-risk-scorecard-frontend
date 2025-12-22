import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { emptyAction, useScenario } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Action, FormScenario } from '../../../utils/types';
import { ActionFormItem } from './ActionFormItem';
import { AddCircle } from '@mui/icons-material';
import Switch from '@mui/material/Switch';
import { useActionFiltersStorage } from '../../../stores/ActionFiltersStore.ts';
import {
  Text,
  Tooltip,
  TooltipTrigger,
  Flex,
  Button,
  Card,
  Box,
} from '@backstage/ui';
import { useSortActionsByRelevance } from '../../../hooks/UseSortActionsByRelevance.ts';
import { filterActionsByRelevance } from '../../../utils/actions.ts';
import { ActionRowList } from '../../action/ActionRowList.tsx';
import styles from './ActionsSection.module.css';

const RelevanceToggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex align="center" gap="0" className={styles.noRelevantActionToggle}>
      <Switch
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        name="showOnlyRelevant"
        color="primary"
      />
      <Text variant="body-medium">{t('dictionary.showOnlyRelevant')}</Text>
    </Flex>
  );
};

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
};

export function ActionsSection({ formMethods, isEditing }: ActionSectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { scenario } = useScenario();

  const [allowActionDeletion, setAllowActionDeletion] =
    useState<boolean>(false);
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
      <Flex justify="between" mb="2">
        <Text variant="title-x-small" weight="bold">
          {t('dictionary.measures')}
        </Text>
        <Flex align="center">
          <RelevanceToggle
            checked={actionFilters.showOnlyRelevant}
            onChange={value => saveOnlyRelevantFilter(value)}
          />
          <TooltipTrigger>
            <Button
              iconStart={
                allowActionDeletion ? (
                  <i className="ri-checkbox-circle-line" />
                ) : (
                  <i className="ri-pencil-line" />
                )
              }
              variant="secondary"
              onClick={() => setAllowActionDeletion(prev => !prev)}
            >
              {allowActionDeletion}
            </Button>
            <Tooltip>
              {allowActionDeletion
                ? t('scenarioTable.doneEditing')
                : t('scenarioTable.editButton')}
            </Tooltip>
          </TooltipTrigger>
        </Flex>
      </Flex>
      {sortedActions !== undefined && sortedActions.length > 0 ? (
        <ActionRowList
          scenarioId={scenario.ID}
          displayedActions={filterActionsByRelevance(
            sortedActions,
            actionFilters.showOnlyRelevant,
          )}
          allowDeletion={allowActionDeletion}
          allowEdit
        />
      ) : (
        <Text variant="body-large" className={styles.italicText}>
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
      <Box>
        <Text variant="title-x-small" weight="bold">
          {t('dictionary.measures')}
        </Text>
      </Box>
      {fields.map((field, index) => (
        <Card key={field.id} className={styles.actionFormItemCard}>
          <ActionFormItem
            key={index}
            formMethods={props.formMethods}
            displayedIndex={index}
            handleDelete={() => remove(index)}
            baseObjectPathToActionOfForm={`actions.${index}`}
          />
        </Card>
      ))}
      <Button
        iconStart={<AddCircle />}
        variant="primary"
        onClick={() => append(emptyAction())}
        className={styles.addActionButton}
      >
        {t('scenarioDrawer.measureTab.addMeasureButton')}
      </Button>
    </Paper>
  );
}
