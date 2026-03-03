import { Table, useTable, CellText, type ColumnConfig } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Scenario } from '../../utils/types.ts';
import { calcRiskCostOfScenario } from '../../utils/risk.ts';
import { RiskMatrixTabs } from './utils.tsx';
import { formatNumber } from '../../utils/utilityfunctions.ts';

type ScenarioReductionRow = {
  id: string;
  title: string;
  potentialReduction: number;
};

type ScenarioReductionTableProps = {
  scenarios: Scenario[];
};

export function ScenarioReductionTable({
  scenarios,
}: ScenarioReductionTableProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const columns: ColumnConfig<ScenarioReductionRow>[] = [
    {
      id: 'scenario',
      label: t('riskMatrix.currentRisk.scenarioColumn'),
      isRowHeader: true,
      cell: item => <CellText title={item.title} />,
    },
    {
      id: 'potentialReduction',
      label: `${t('riskMatrix.currentRisk.reductionColumn')} (${t('riskMatrix.estimatedRisk.unit.nokPerYear')})`,
      cell: item => (
        <CellText title={formatNumber(item.potentialReduction, t)} />
      ),
    },
  ];

  const data: ScenarioReductionRow[] = scenarios.map(scenario => {
    const currentRiskCost = calcRiskCostOfScenario(
      scenario,
      RiskMatrixTabs.currentRisk,
    );
    const remainingRiskCost = calcRiskCostOfScenario(
      scenario,
      RiskMatrixTabs.remainingRisk,
    );

    return {
      id: scenario.ID,
      title: scenario.title,
      potentialReduction: currentRiskCost - remainingRiskCost,
    };
  });

  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => data,
    paginationOptions: {
      pageSize: 5,
      showPageSizeOptions: false,
    },
  });

  return <Table columnConfig={columns} {...tableProps} />;
}
