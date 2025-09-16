import { ActionBox } from './ActionBox';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { emptyAction } from '../../../contexts/ScenarioContext';
import { section } from '../scenarioDrawerComponents';
import { emptyState, heading3 } from '../../common/typography';
import Divider from '@mui/material/Divider';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Action, FormScenario } from '../../../utils/types';
import { ActionFormItem } from './ActionFormItem';
import Button from '@mui/material/Button';
import { AddCircle } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { ActionStatusOptions } from '../../../utils/constants';
import Switch from '@mui/material/Switch';

const FILTER_SETTINGS = {
  SHOW_ALL: false,
  SHOW_ONLY_RELEVANT: true,
} as const;

type ActionSectionProps = {
  formMethods: UseFormReturn<FormScenario>;
  isEditing: boolean;
  onSubmit: () => void;
  setCurrentUpdatedActionIDs: React.Dispatch<React.SetStateAction<string[]>>;
};

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
      <Typography variant="subtitle2" color="primary">
        {t('dictionary.showOnlyRelevant')}
      </Typography>
    </Box>
  );
};

export function ActionsSection({
  formMethods,
  isEditing,
  onSubmit,
  setCurrentUpdatedActionIDs,
}: ActionSectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isDrawerOpen, submitEditedScenarioToRiSc, scenario } = useScenario();

  const { control, watch } = formMethods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const currentActions = watch('actions');

  const [showOnlyRelevant, setShowOnlyRelevant] = useState<boolean>(
    FILTER_SETTINGS.SHOW_ALL,
  );

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
          originalIndex: currentActions.findIndex(a => a === action),
        })),
      );
    }
    // ESLint-ignore: only sort when drawer opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, sortActionsByRelevance]);

  const [currentUpdatedActionIDs, setCurrentUpdatedActionIDs] = useState<
    string[]
  >([]);

  const debounceCallback = useCallback(
    (updatedIDs: string[]) => {
      const indexOfAction = (ID: string) => {
        return scenario.actions.findIndex(a => a.ID === ID);
      };
      if (updatedIDs.length === 0) return;

      const formValues = formMethods.getValues();
      const updatedScenario = {
        ...scenario,
        actions: scenario.actions.map(a =>
          updatedIDs.includes(a.ID)
            ? {
                ...a,
                status:
                  formValues.actions?.[indexOfAction(a.ID)]?.status ?? a.status,
                lastUpdated: new Date(),
              }
            : a,
        ),
      };
      submitEditedScenarioToRiSc(updatedScenario);
      setCurrentUpdatedActionIDs([]);
    },
    [
      scenario,
      formMethods,
      setCurrentUpdatedActionIDs,
      submitEditedScenarioToRiSc,
    ],
  );

  useDebounce(currentUpdatedActionIDs, 6000, debounceCallback);

  const visibleActions = processedActions.filter(({ action }) =>
    showOnlyRelevant ? action.status !== ActionStatusOptions.NotRelevant : true,
  );

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography sx={heading3}>{t('dictionary.measures')}</Typography>

        <RelevanceToggle
          checked={showOnlyRelevant}
          onChange={value => setShowOnlyRelevant(value)}
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
        <Typography sx={emptyState}>
          {!currentActions || currentActions.length === 0
            ? t('dictionary.emptyField', {
                field: t('dictionary.measures').toLowerCase(),
              })
            : t('dictionary.noRelevantMeasures')}
        </Typography>
      )}
    </Paper>
  );
}
