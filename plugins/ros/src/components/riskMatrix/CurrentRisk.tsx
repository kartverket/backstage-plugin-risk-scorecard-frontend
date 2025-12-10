import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScWithMetadata } from '../../utils/types';
import { Box, Text } from '@backstage/ui';
import { ActionStatusOptions } from '../../utils/constants';
import { calcRiskCostOfRiSc, getCurrentCostColor } from '../../utils/risk';
import { RiskMatrixTabs } from './utils';

type CurrentRiskProps = {
  risc: RiScWithMetadata;
  currentTab: RiskMatrixTabs;
};

export function CurrentRisk({ risc, currentTab }: CurrentRiskProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const totalActions = risc.content.scenarios.reduce(
    (total, scenario) => total + scenario.actions.length,
    0,
  );

  const actionsOk = risc.content.scenarios.reduce(
    (total, scenario) =>
      total +
      scenario.actions.filter(
        action => action.status === ActionStatusOptions.OK,
      ).length,
    0,
  );

  const progressPercentage =
    totalActions > 0 ? (actionsOk / totalActions) * 100 : 0;

  // Calculate initial and remaining risk costs
  const initialRiskCost = calcRiskCostOfRiSc(risc.content, currentTab);

  const remainingRiskCost = risc.content.scenarios
    .map(
      scenario =>
        scenario.remainingRisk.probability * scenario.remainingRisk.consequence,
    )
    .reduce((a, b) => a + b, 0);

  // Estimate current cost based on action completion (linear interpolation)
  const costReduction = initialRiskCost - remainingRiskCost;
  const estimatedCurrentCost =
    initialRiskCost - (costReduction * actionsOk) / totalActions;

  // Calculate current cost as percentage of initial risk cost
  const currentCostPercentage =
    initialRiskCost > 0 ? (estimatedCurrentCost / initialRiskCost) * 100 : 0;

  return (
    <Box style={{ marginTop: '18px' }}>
      <Text variant="title-x-small" weight="bold">
        Current Risk Component for {risc.content.title}
      </Text>

      <Box style={{ marginTop: '16px' }}>
        <Text variant="body-large" weight="bold">
          Overall Risk Cost Progress
        </Text>
        <Box
          style={{
            width: '100%',
            height: '60px',
            backgroundColor: 'var(--ros-gray-100)',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '8px',
            border: '2px solid black',
          }}
        >
          {/* Calculate percentages for cost visualization */}
          {initialRiskCost > 0 && (
            <>
              {/* Green fill for progress from current to target */}
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  right: `${(100 - (estimatedCurrentCost / initialRiskCost) * 100).toFixed(2)}%`,
                  top: 0,
                  bottom: 0,
                  backgroundColor: getCurrentCostColor(
                    estimatedCurrentCost,
                    initialRiskCost,
                    remainingRiskCost,
                  ),
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                }}
              >
                {/* Percentage text inside the filled area */}
                {currentCostPercentage > 10 && (
                  <Text
                    variant="body-large"
                    weight="bold"
                    style={{
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {Math.round(currentCostPercentage)}%
                  </Text>
                )}
              </Box>
              {/* Current Cost marker */}
              <Box
                style={{
                  position: 'absolute',
                  left: `${((estimatedCurrentCost / initialRiskCost) * 100).toFixed(2)}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'var(--bui-black)',
                  transform: 'translateX(-50%)',
                }}
              />
            </>
          )}
        </Box>
      </Box>

      <Box style={{ marginTop: '24px' }}>
        <Text variant="body-large" weight="bold">
          Action Progress
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
          }}
        >
          <Box style={{ flex: 1 }}>
            <Box
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: 'var(--ros-grey-100)',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid black',
              }}
            >
              <Box
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  backgroundColor: 'var(--ros-green-300)',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="body-large" weight="bold">
                  {actionsOk} / {totalActions} Actions Completed
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
