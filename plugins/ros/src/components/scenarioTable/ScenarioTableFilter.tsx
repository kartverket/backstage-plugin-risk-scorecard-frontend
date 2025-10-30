import {
  Select,
  Flex,
  Button,
  TooltipTrigger,
  Tooltip,
  SearchField,
} from '@backstage/ui';
import { AddScenarioButton } from './AddScenarioButton.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type ScenarioTableFilterProps = {
  value: string | null;
  onChange: (sortOrder: string | null) => void;
  isEditing: boolean;
  isEditingAllowed: boolean;
  onNewScenario: () => void;
  onToggleEdit: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
};

export function ScenarioTableFilter(props: ScenarioTableFilterProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Flex justify="between" gap="16px">
      <Flex style={{ flex: 1 }}>
        <SearchField
          placeholder="Søk etter tiltak ..."
          value={props.searchQuery}
          onChange={value => props.onSearchQueryChange(value)}
        />
      </Flex>
      <Flex>
        <Select
          aria-label="sortering"
          selectedKey={props.value ?? ''}
          onSelectionChange={key => props.onChange(key?.toString() ?? null)}
          options={[
            { value: '', label: t('dictionary.customOrder') },
            { value: 'title', label: t('filter.title') },
            { value: 'initialRisk', label: t('filter.initialRisk') },
            {
              value: 'implementedActions',
              label: t('filter.completedActions'),
            },
            { value: 'remainingActions', label: t('filter.remainingActions') },
          ]}
        />
        {props.isEditingAllowed && (
          <>
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
          </>
        )}
      </Flex>
    </Flex>
  );
}
