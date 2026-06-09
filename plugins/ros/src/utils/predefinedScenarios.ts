import { ProfileInfo } from '@backstage/core-plugin-api';
import { Action, RiScWithMetadata, Scenario } from './types.ts';
import { ActionStatusOptions } from './constants.ts';
import { getActionsWithLastUpdated } from './actions.ts';
import { dtoToScenario, ScenarioDTO } from './DTOs.ts';

/** An action template with a stable, repo-sourced ID. */
export type PredefinedActionTemplate = Omit<
  Action,
  'lastUpdated' | 'lastUpdatedBy'
>;

/** A scenario template with a stable, repo-sourced ID. */
export type PredefinedScenarioTemplate = Omit<Scenario, 'actions'> & {
  actions: PredefinedActionTemplate[];
};

/**
 * Builds cleaned predefined scenario templates from raw initial-risc scenarios
 * (the nested {@link ScenarioDTO} shape), keeping only the scenarios whose
 * `scenario.ID` is in `wantedIds`.
 * The `ID` of each scenario/action is the stable identifier used for presence
 * detection, so the source IDs must remain unique and stable while this feature
 * is live and must match the RiSc schema pattern `^[a-zA-Z0-9]{5,}$`.
 */
export function buildPredefinedScenarioTemplates(
  scenarioDTOs: ScenarioDTO[],
  wantedIds: string[],
): PredefinedScenarioTemplate[] {
  const wanted = new Set(wantedIds);

  return scenarioDTOs
    .filter(dto => wanted.has(dto.scenario.ID))
    .map(dtoToScenario)
    .map(scenario => ({
      ...scenario,
      actions: scenario.actions.map(
        ({ lastUpdated, lastUpdatedBy, ...rest }) => ({
          ...rest,
          status: ActionStatusOptions.NotOK,
        }),
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

export function buildPredefinedScenarios(
  templates: PredefinedScenarioTemplate[],
  profileInfo?: ProfileInfo,
): Scenario[] {
  return templates.map(template => ({
    ...template,
    actions: getActionsWithLastUpdated(
      [],
      template.actions.map(action => ({ ...action })),
      template.actions.map(action => action.ID),
      profileInfo,
    ),
  }));
}