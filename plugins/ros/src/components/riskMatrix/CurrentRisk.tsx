import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScWithMetadata } from '../../utils/types';
import { Box, Text, Flex } from '@backstage/ui';
import { ActionStatusOptions } from '../../utils/constants';
import { calcRiskCostOfRiSc, getRiskGradient } from '../../utils/risk';
import { RiskMatrixTabs } from './utils';
import styles from './CurrentRisk.module.css';
import { formatNumber } from '../../utils/utilityfunctions';

type CurrentRiskProps = {
  risc: RiScWithMetadata;
};

// Bruke en gradient bar for å vise om current risk faktisk er bra/dårlig.

export function CurrentRisk({ risc }: CurrentRiskProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const actionsOk = risc.content.scenarios.reduce(
    (total, scenario) =>
      total +
      scenario.actions.filter(
        action => action.status === ActionStatusOptions.OK,
      ).length,
    0,
  );

  const initialRiskCost = calcRiskCostOfRiSc(
    risc.content,
    RiskMatrixTabs.initialRisk,
  );
  const remainingRiskCost = calcRiskCostOfRiSc(
    risc.content,
    RiskMatrixTabs.remainingRisk,
  );
  const estimatedCurrentCost = calcRiskCostOfRiSc(
    risc.content,
    RiskMatrixTabs.currentRisk,
  );

  const costReduction = initialRiskCost - remainingRiskCost;

  // Calculate progress percentage (how much cost has been reduced)
  const costReductionPercentage =
    costReduction > 0
      ? ((initialRiskCost - estimatedCurrentCost) / costReduction) * 100
      : 0;

  const clampedPercentage = Math.max(
    0,
    Math.min(100, Number(costReductionPercentage.toFixed(2))),
  );

  let labelTransform = 'translateX(-50%)';
  if (clampedPercentage <= 5) {
    labelTransform = 'translateX(0%)';
  } else if (clampedPercentage >= 95) {
    labelTransform = 'translateX(-100%)';
  }

  const reduction = formatNumber(initialRiskCost - estimatedCurrentCost, t);

  const description = t('riskMatrix.currentRisk.description', {
    actionsOk: String(actionsOk),
    reduction,
  });

  return (
    <Flex direction="column" mt="18px">
      <Flex direction="column" mt="16px" mb="16px">
        <Text variant="title-x-small" weight="bold">
          {t('riskMatrix.currentRisk.title')}
        </Text>
        <Flex direction="column" gap="0">
          <Flex justify="between" px="4px" align="end">
            <Flex direction="column" align="start" gap="0">
              <Text variant="body-small" weight="bold">
                {formatNumber(initialRiskCost, t)}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
              </Text>
              <Text variant="body-medium">← {t('dictionary.initialRisk')}</Text>
            </Flex>
            <Flex direction="column" align="end" gap="0">
              <Text variant="body-small" weight="bold">
                {formatNumber(remainingRiskCost, t)}{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
              </Text>
              <Text variant="body-medium">{t('dictionary.restRisk')} →</Text>
            </Flex>
          </Flex>
          <Box className={styles.currentRiskBarWrapper}>
            <Box className={styles.currentRiskBarContainer}>
              {initialRiskCost > 0 && (
                <>
                  <Flex
                    align="center"
                    justify="end"
                    className={styles.currentRiskBarFill}
                    style={{
                      background: getRiskGradient(),
                    }}
                  />
                  <Box
                    className={styles.currentRiskMarker}
                    style={{
                      left: `${clampedPercentage}%`,
                    }}
                  />
                </>
              )}
            </Box>
            <Flex
              className={styles.currentRiskPercentageLabel}
              style={{
                left: `${clampedPercentage}%`,
                transform: labelTransform,
              }}
            >
              <Text variant="body-small" weight="bold">
                {t('dictionary.currentRisk')}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>

      <Flex>
        <Text
          variant="body-large"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </Flex>
    </Flex>
  );
}
