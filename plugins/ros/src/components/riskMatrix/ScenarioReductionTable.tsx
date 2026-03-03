import {
  Table,
  useTable,
  Cell,
  CellText,
  type ColumnConfig,
  Link,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { calcRiskCostOfScenario } from '../../utils/risk.ts';
import { RiskMatrixTabs } from './utils.tsx';
import { formatNumber } from '../../utils/utilityfunctions.ts';
import { useScenario } from '../../contexts/ScenarioContext.tsx';

type ScenarioReductionRow = {
  id: string;
  title: string;
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

  const canEdit =
    riScWithMetadata.status !== RiScStatus.DeletionDraft &&
    riScWithMetadata.status !== RiScStatus.DeletionSentForApproval;

  function handleScenarioClick(id: string) {
    onNavigate();
    openScenarioDrawer(id, canEdit);
  }

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
      id: 'potentialReduction',
      label: `${t('riskMatrix.currentRisk.reductionColumn')} (${t('riskMatrix.estimatedRisk.unit.nokPerYear')})`,
      defaultWidth: '1fr',
      minWidth: 230,
      cell: item => (
        <CellText title={formatNumber(item.potentialReduction, t)} />
      ),
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

      return {
        id: scenario.ID,
        title: scenario.title,
        potentialReduction: currentRiskCost - remainingRiskCost,
      };
    })
    .sort((a, b) => b.potentialReduction - a.potentialReduction);

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
