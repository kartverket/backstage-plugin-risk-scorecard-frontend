import {
  Table,
  useTable,
  Cell,
  CellText,
  Flex,
  Select,
  Text,
  type ColumnConfig,
  Link,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import {
  calcRiskCostOfScenario,
  calcRemainingActionsCount,
} from '../../utils/risk.ts';
import { RiskMatrixTabs } from './utils.tsx';
import { formatNumber } from '../../utils/utilityfunctions.ts';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { useState } from 'react';
import styles from './ScenarioReductionTable.module.css';

type MetricKey = 'currentRisk' | 'reductionPerAction' | 'potentialReduction';

type ScenarioReductionRow = {
  id: string;
  title: string;
  currentRisk: number;
  reductionPerAction: number;
  potentialReduction: number;
};

type ScenarioReductionTableProps = {
  riScWithMetadata: RiScWithMetadata;
  onNavigate: () => void;
};

export function ScenarioReductionTable({
  riScWithMetadata,
  onNavigate,
}: ScenarioReductionTableProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { openScenarioDrawer } = useScenario();
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>('potentialReduction');

  const canEdit =
    riScWithMetadata.status !== RiScStatus.DeletionDraft &&
    riScWithMetadata.status !== RiScStatus.DeletionSentForApproval;

  function handleScenarioClick(id: string) {
    onNavigate();
    openScenarioDrawer(id, canEdit);
  }

  const metricOptions: Array<{ value: MetricKey; label: string }> = [
    {
      value: 'potentialReduction',
      label: t('riskMatrix.currentRisk.metricPotentialReduction'),
    },
    {
      value: 'currentRisk',
      label: t('riskMatrix.currentRisk.metricCurrentRisk'),
    },
    {
      value: 'reductionPerAction',
      label: t('riskMatrix.currentRisk.metricReductionPerAction'),
    },
  ];

  const metricLabel =
    metricOptions.find(o => o.value === selectedMetric)?.label ?? '';

  const columns: ColumnConfig<ScenarioReductionRow>[] = [
    {
      id: 'scenario',
      label: t('riskMatrix.currentRisk.scenarioColumn'),
      isRowHeader: true,
      defaultWidth: '2fr',
      cell: item => (
        <Cell>
          <Link
            variant="body-medium"
            onPress={() => handleScenarioClick(item.id)}
          >
            {item.title}
          </Link>
        </Cell>
      ),
    },
    {
      id: 'metric',
      label: `${metricLabel} (${t('riskMatrix.estimatedRisk.unit.nokPerYear')})`,
      defaultWidth: '1fr',
      minWidth: 230,
      cell: item => <CellText title={formatNumber(item[selectedMetric], t)} />,
    },
  ];

  const scenarios = riScWithMetadata.content.scenarios;

  const data: ScenarioReductionRow[] = scenarios
    .map(scenario => {
      const currentRiskCost = calcRiskCostOfScenario(
        scenario,
        RiskMatrixTabs.currentRisk,
      );
      const remainingRiskCost = calcRiskCostOfScenario(
        scenario,
        RiskMatrixTabs.remainingRisk,
      );
      const potentialReduction = currentRiskCost - remainingRiskCost;
      const remainingActions = calcRemainingActionsCount(scenario);

      return {
        id: scenario.ID,
        title: scenario.title,
        currentRisk: currentRiskCost,
        reductionPerAction:
          remainingActions > 0 ? potentialReduction / remainingActions : 0,
        potentialReduction,
      };
    })
    .sort((a, b) => b[selectedMetric] - a[selectedMetric]);

  const { tableProps } = useTable({
    mode: 'complete',
    data,
    paginationOptions: {
      pageSize: 5,
      showPageSizeOptions: false,
    },
  });

  return (
    <Flex direction="column" gap="16px">
      <Flex direction="column" gap="4px">
        <Text variant="body-medium">
          {t('riskMatrix.currentRisk.dialogDescription')}
        </Text>
        <ul className={styles.metricList}>
          <li>
            <Text variant="body-medium">
              <Text weight="bold">
                {t('riskMatrix.currentRisk.metricCurrentRisk')}
              </Text>
              {' — '}
              {t('riskMatrix.currentRisk.metricCurrentRiskDescription')}
            </Text>
          </li>
          <li>
            <Text variant="body-medium">
              <Text weight="bold">
                {t('riskMatrix.currentRisk.metricPotentialReduction')}
              </Text>
              {' — '}
              {t('riskMatrix.currentRisk.metricPotentialReductionDescription')}
            </Text>
          </li>
          <li>
            <Text variant="body-medium">
              <Text weight="bold">
                {t('riskMatrix.currentRisk.metricReductionPerAction')}
              </Text>
              {' — '}
              {t('riskMatrix.currentRisk.metricReductionPerActionDescription')}
            </Text>
          </li>
        </ul>
      </Flex>
      <Select
        aria-label={t('riskMatrix.currentRisk.metricLabel')}
        value={selectedMetric}
        onChange={key => {
          if (key) setSelectedMetric(key as MetricKey);
        }}
        options={metricOptions}
      />
      <Table columnConfig={columns} {...tableProps} />
    </Flex>
  );
}
