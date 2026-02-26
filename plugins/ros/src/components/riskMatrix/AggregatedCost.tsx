import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useState } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiSc } from '../../utils/types';
import { formatNumber } from '../../utils/utilityfunctions';
import { EstimatedRiskInfoDialog } from './EstimatedRiskInfoDialog';
import { Box, ButtonIcon, Flex, Text } from '@backstage/ui';
import styles from './AggregatedCost.module.css';
import { calcRiskCostOfRiSc } from '../../utils/risk';
import { RiskMatrixTabs } from './utils';

interface AggregatedCostProps {
  riSc: RiSc;
  riskType?: RiskMatrixTabs;
}

export function AggregatedCost({ riSc, riskType }: AggregatedCostProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [showDialog, setShowDialog] = useState(false);

  const cost = calcRiskCostOfRiSc(riSc, riskType);

  const estimatedRiskTitle = {
    [RiskMatrixTabs.initialRisk]: t('dictionary.estimatedInitialRisk'),
    [RiskMatrixTabs.remainingRisk]: t('dictionary.estimatedRemainingRisk'),
    [RiskMatrixTabs.currentRisk]: t('dictionary.estimatedCurrentRisk'),
  } as const;

  const riskExplanation = {
    [RiskMatrixTabs.initialRisk]: t('dictionary.riskExplanation.initial'),
    [RiskMatrixTabs.currentRisk]: t('dictionary.riskExplanation.current'),
    [RiskMatrixTabs.remainingRisk]: t('dictionary.riskExplanation.remaining'),
  } as const;

  const title = riskType
    ? estimatedRiskTitle[riskType]
    : t('riskMatrix.estimatedRisk.title');

  const explanation = riskType ? riskExplanation[riskType] : undefined;

  return (
    <Box className={styles.boxStyle}>
      <Text as="h3" variant="body-large">
        <Text as="span" weight="bold">
          {title}
        </Text>

        {explanation && (
          <Text as="span" weight="regular">
            {' '}
            ({explanation})
          </Text>
        )}
      </Text>
      <Flex align="center" gap="0">
        <Text variant="body-large">
          {formatNumber(cost, t)}{' '}
          {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
        </Text>
        <ButtonIcon
          size="small"
          variant="tertiary"
          aria-label="Info"
          icon={
            <i
              className="ri-information-fill"
              style={{ fontSize: '24px', color: 'var(--bui-fg-secondary)' }}
            />
          }
          onPress={() => setShowDialog(true)}
        />
      </Flex>
      <EstimatedRiskInfoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        riskTab={riskType}
      />
    </Box>
  );
}
