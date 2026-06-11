import { ProfileInfo } from '@backstage/core-plugin-api';
import { RiScWithMetadata, Scenario } from './types.ts';
import { getActionsWithLastUpdated } from './actions.ts';
import { dtoToScenario, ScenarioDTO } from './DTOs.ts';

export function buildPredefinedScenarios(
  scenarioDTOs: ScenarioDTO[],
  profileInfo?: ProfileInfo,
): Scenario[] {
  return scenarioDTOs.map(dtoToScenario).map(scenario => ({
    ...scenario,
    actions: getActionsWithLastUpdated(
      [],
      scenario.actions,
      scenario.actions.map(action => action.ID),
      profileInfo,
    ),
  }));
}

export function hasAnyPredefinedScenario(
  riSc: RiScWithMetadata,
  predefinedScenarioIds: string[],
): boolean {
  const predefinedIds = new Set(predefinedScenarioIds);
  return riSc.content.scenarios.some(scenario =>
    predefinedIds.has(scenario.ID),
  );
}
