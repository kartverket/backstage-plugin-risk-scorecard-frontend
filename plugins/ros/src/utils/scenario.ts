import { RiScWithMetadata, Scenario } from './types.ts';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from './utilityfunctions.ts';
import { ActionStatusOptions } from './constants.ts';

export type ScenarioSortingOptions =
  | 'NoSorting'
  | 'TitleAlphabetical'
  | 'HighestInitialRisk'
  | 'MostImplementedActions'
  | 'MostRemainingActions';

export function toScenarioSortingOption(
  value: string | null | undefined,
): ScenarioSortingOptions {
  if (!value) return 'NoSorting';
  const valid: ScenarioSortingOptions[] = [
    'NoSorting',
    'TitleAlphabetical',
    'HighestInitialRisk',
    'MostImplementedActions',
    'MostRemainingActions',
  ];

  return valid.includes(value as ScenarioSortingOptions)
    ? (value as ScenarioSortingOptions)
    : 'NoSorting';
}

export function getScenarioOfIdFromRiSc(
  id: string,
  riSc: RiScWithMetadata | null,
): Scenario | null {
  const oldScenario = riSc?.content.scenarios.find(s => s.ID === id);
  return oldScenario ?? null;
}

/**
 * The function does the following:
 * 1) Remove all actions not matching search query
 * 2) Remove all actions not matching updated-status filter
 * 3) Remove scenarios with no remaining actions after 1) and 2)
 *
 * @param scenarios
 * @param visibleUpdatedStatus
 * @param actionSearchQuery
 *
 * @return A map where a scenarioId is mapped to a list of actionIds
 */
export function useFilteredActionsForScenarios(
  scenarios: Scenario[],
  visibleUpdatedStatus: UpdatedStatusEnumType | null | undefined,
  actionSearchQuery: string,
): Map<string, string[]> {
  const scenarioFilteredActionsMap = new Map<string, string[]>();

  scenarios.forEach(scenario => {
    const actions = [...scenario.actions];

    const filteredActions = actions
      // Remove actions not matching search query
      .filter(
        action =>
          !actionSearchQuery ||
          action.title.toLowerCase().includes(actionSearchQuery.toLowerCase()),
      )
      // Remove actions not matching chosen updated status
      .filter(action => {
        if (!visibleUpdatedStatus) return true;

        const daysSinceLastUpdate = action.lastUpdated
          ? calculateDaysSince(new Date(action.lastUpdated))
          : null;

        const updatedStatus =
          daysSinceLastUpdate !== null
            ? calculateUpdatedStatus(daysSinceLastUpdate)
            : UpdatedStatusEnum.VERY_OUTDATED;

        return updatedStatus === visibleUpdatedStatus;
      });
    scenarioFilteredActionsMap.set(
      scenario.ID,
      filteredActions.map(action => action.ID),
    );
  });

  // Remove scenarios with no actions
  scenarioFilteredActionsMap.forEach((actions, scenarioId) => {
    if (actions.length === 0) {
      scenarioFilteredActionsMap.delete(scenarioId);
    }
  });

  return scenarioFilteredActionsMap;
}

export function sortScenarios(
  scenarios: Scenario[],
  sortOrder: ScenarioSortingOptions,
) {
  if (sortOrder !== 'NoSorting') {
    scenarios.sort((a, b) => {
      switch (sortOrder) {
        case 'TitleAlphabetical':
          return a.title.localeCompare(b.title, 'en');

        case 'HighestInitialRisk':
          return (
            b.risk.consequence * b.risk.probability -
            a.risk.consequence * a.risk.probability
          );

        case 'MostImplementedActions':
          return (
            b.actions.filter(status => status.status === ActionStatusOptions.OK)
              .length -
            a.actions.filter(status => status.status === ActionStatusOptions.OK)
              .length
          );

        case 'MostRemainingActions': {
          const remainingA = a.actions.filter(
            action =>
              action.status !== ActionStatusOptions.OK &&
              action.status !== ActionStatusOptions.NotRelevant,
          ).length;
          const remainingB = b.actions.filter(
            action =>
              action.status !== ActionStatusOptions.OK &&
              action.status !== ActionStatusOptions.NotRelevant,
          ).length;
          return remainingB - remainingA;
        }

        default:
          return 0;
      }
    });
  }
}
