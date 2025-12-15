import { RiSc, Scenario } from './types.ts';
import { ActionStatusOptions } from './constants.ts';
import { RiskMatrixTabs } from '../components/riskMatrix/utils.tsx';

export function calcRiskCostOfRiSc(riSc: RiSc, riskType?: RiskMatrixTabs) {
  return riSc.scenarios
    .map(scenario => calcRiskCostOfScenario(scenario, riskType))
    .reduce((a, b) => a + b, 0);
}

function calcRiskCostOfScenario(
  scenario: Scenario,
  riskType?: RiskMatrixTabs,
): number {
  const startRiskCost = scenario.risk.probability * scenario.risk.consequence;
  const endRiskCost =
    scenario.remainingRisk.probability * scenario.remainingRisk.consequence;
  if (riskType === RiskMatrixTabs.initialRisk) return startRiskCost;
  if (riskType === RiskMatrixTabs.remainingRisk) return endRiskCost;

  if (riskType === RiskMatrixTabs.currentRisk) {
    const completedActionsRatio = calcCompletedActionsRatio(scenario);
    return (
      startRiskCost + (endRiskCost - startRiskCost) * completedActionsRatio
    );
  }
  return -1; // Should never happen
}

function calcCompletedActionsRatio(scenario: Scenario) {
  const numOfCompletedActions = scenario.actions.filter(
    action => (action.status as ActionStatusOptions) === ActionStatusOptions.OK,
  ).length;

  const numOfRelevantActions = scenario.actions.filter(
    action =>
      (action.status as ActionStatusOptions) !==
      ActionStatusOptions.NotRelevant,
  ).length;

  return numOfCompletedActions / numOfRelevantActions;
}

export function getRiskGradient(): string {
  return `linear-gradient(to right, 
    var(--ros-red-400) 0%, 
    var(--ros-red-300) 25%, 
    var(--ros-orange-100) 50%, 
    var(--ros-green-100) 100%)`;
}
