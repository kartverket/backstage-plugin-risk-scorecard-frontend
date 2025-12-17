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
  const startRiskCost =
    (scenario.risk?.probability ?? 0) * (scenario.risk?.consequence ?? 0);
  const endRiskCost =
    (scenario.remainingRisk?.probability ?? 0) *
    (scenario.remainingRisk?.consequence ?? 0);
  if (riskType === RiskMatrixTabs.initialRisk) return startRiskCost;
  if (riskType === RiskMatrixTabs.remainingRisk) return endRiskCost;

  if (riskType === RiskMatrixTabs.currentRisk) {
    const completedActionsRatio = calcCompletedActionsRatio(scenario);
    return (
      startRiskCost + (endRiskCost - startRiskCost) * completedActionsRatio
    );
  }
  throw new Error('Unable to calculate risk cost: unhandled risk type');
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

  if (numOfRelevantActions === 0) {
    return 0;
  }

  return numOfCompletedActions / numOfRelevantActions;
}

export function getRiskGradient(): string {
  return `linear-gradient(to right, 
    var(--ros-red-400) 0%, 
    var(--ros-red-300) 25%, 
    var(--ros-orange-100) 50%, 
    var(--ros-green-100) 100%)`;
}
