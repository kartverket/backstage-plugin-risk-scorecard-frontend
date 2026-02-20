import { Table, useTable, CellText, type ColumnConfig } from '@backstage/ui';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import {
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from '../../utils/constants.ts';

type ThreatActorTranslationKey = `threatActors.${ThreatActorsOptions}`;
type VulnerabilityTranslationKey = `vulnerabilities.${VulnerabilitiesOptions}`;

type CoverageTableRow = {
  id: string;
  numOfCoveringScenarios: number;
  typeLabel: string;
};

type CoverageTableProps = {
  coverageType: CoverageType;
  coverageMap: Map<string, number>;
};
export function CoverageTable(props: CoverageTableProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const firstColumnLabel =
    props.coverageType === CoverageType.ThreatActor
      ? t('threatActorsAndVulnerabilities.tableColumnThreatActor')
      : t('threatActorsAndVulnerabilities.tableColumnVulnerability');

  const columns: ColumnConfig<CoverageTableRow>[] = [
    {
      id: 'coverageType',
      label: firstColumnLabel,
      isRowHeader: true,
      cell: item => <CellText title={item.typeLabel} />,
    },
    {
      id: 'numOfCoveringScenarios',
      label: t('threatActorsAndVulnerabilities.tableColumnScenarios'),
      cell: item => (
        <CellText
          title={
            item.numOfCoveringScenarios === 0
              ? '0 ⚠️️'
              : item.numOfCoveringScenarios.toString()
          }
        />
      ),
    },
  ];

  const translationPrefix =
    props.coverageType === CoverageType.ThreatActor
      ? 'threatActors'
      : 'vulnerabilities';

  const data: CoverageTableRow[] = Array.from(props.coverageMap.entries()).map(
    ([key, count]) => ({
      id: key,
      numOfCoveringScenarios: count,
      typeLabel: t(
        `${translationPrefix}.${key}` as
          | ThreatActorTranslationKey
          | VulnerabilityTranslationKey,
      ),
    }),
  );

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
