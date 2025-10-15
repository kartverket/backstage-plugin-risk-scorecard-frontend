import {
  Box,
  Select,
  Flex,
  Button,
  TooltipTrigger,
  Tooltip,
} from '@backstage/ui';
import { AddScenarioButton } from './AddScenarioButton.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type ScenarioTableFilterProps = {
  value: string | undefined;
  onChange: (sortOrder: string | undefined) => void;
  isEditing: boolean;
  isEditingAllowed: boolean;
  onNewScenario: () => void;
  onToggleEdit: () => void;
};

export function ScenarioTableFilter(props: ScenarioTableFilterProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Flex justify="end" my="2">
      <Box style={{ width: '210px' }}>
        <Select
          aria-label="sortering"
          placeholder="Sorter scenarioer"
          selectedKey={props.value}
          onSelectionChange={key =>
            props.onChange(key?.toString() ?? undefined)
          }
          options={[
            { value: 'title', label: t('filter.title') },
            { value: 'initialRisk', label: t('filter.initialRisk') },
            {
              value: 'implementedActions',
              label: t('filter.completedActions'),
            },
            { value: 'remainingActions', label: t('filter.remainingActions') },
          ]}
        />
      </Box>
      {props.isEditingAllowed && (
        <Flex justify="end" align="center">
          <AddScenarioButton onNewScenario={props.onNewScenario} />
          <TooltipTrigger>
            <Button
              iconStart={
                props.isEditing ? (
                  <i className="ri-checkbox-circle-line" />
                ) : (
                  <i className="ri-pencil-line" />
                )
              }
              variant="secondary"
              onClick={props.onToggleEdit}
            >
              {props.isEditing}
            </Button>
            <Tooltip>
              {props.isEditing
                ? t('scenarioTable.doneEditing')
                : t('scenarioTable.editButton')}
            </Tooltip>
          </TooltipTrigger>
        </Flex>
      )}
    </Flex>
  );
}
