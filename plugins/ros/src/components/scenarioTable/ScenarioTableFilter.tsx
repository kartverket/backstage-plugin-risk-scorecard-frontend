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
  scenarioSortOrder: string | null;
  onScenarioSortOrderChange: (sortOrder: string | null) => void;
  actionSearchQuery: string;
  onActionSearchQueryChange: (query: string) => void;
  isEditingScenarioTable: boolean;
  isEditingScenarioTableAllowed: boolean;
  onToggleEditScenarioTable: () => void;
  onNewScenario: () => void;
};

export function ScenarioTableFilter(props: ScenarioTableFilterProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Flex justify="between" gap="16px">
      <Flex style={{ flex: 1 }}>
        <SearchField
          placeholder="Søk etter tiltak ..."
          aria-label="search field"
          value={props.actionSearchQuery}
          onChange={value => props.onActionSearchQueryChange(value)}
        />
      </Flex>
      <Flex>
        <Select
          aria-label="sortering"
          defaultValue={props.scenarioSortOrder ?? 'NoSorting'}
          onSelectionChange={key =>
            props.onScenarioSortOrderChange(key?.toString() ?? 'NoSorting')
          }
          options={[
            { value: 'NoSorting', label: t('dictionary.customOrder') },
            { value: 'TitleAlphabetical', label: t('filter.title') },
            { value: 'HighestInitialRisk', label: t('filter.initialRisk') },
            {
              value: 'MostImplementedActions',
              label: t('filter.completedActions'),
            },
            {
              value: 'MostRemainingActions',
              label: t('filter.remainingActions'),
            },
          ]}
        />
        {props.isEditingScenarioTableAllowed && (
          <>
            <AddScenarioButton onNewScenario={props.onNewScenario} />
            <TooltipTrigger>
              <Button
                iconStart={
                  props.isEditingScenarioTable ? (
                    <i className="ri-checkbox-circle-line" />
                  ) : (
                    <i className="ri-pencil-line" />
                  )
                }
                variant="secondary"
                onClick={props.onToggleEditScenarioTable}
              >
                {props.isEditingScenarioTable}
              </Button>
              <Tooltip>
                {props.isEditingScenarioTable
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
