import { Table, useTable, CellText, type ColumnConfig } from '@backstage/ui';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';

type CoverageTableRow = {
  id: string;
  numOfCoveringScenarios: number;
  typeLabel: string;
};

type CoverageTableProps = {
  coverageType: CoverageType;
};
export function CoverageTable(props: CoverageTableProps) {
  const firstColumnLabel =
    props.coverageType === CoverageType.ThreatActor
      ? 'Trusselaktør'
      : 'Sårbarhet';

  const columns: ColumnConfig<CoverageTableRow>[] = [
    {
      id: 'coverageType',
      label: firstColumnLabel,
      isRowHeader: true,
      cell: item => <CellText title={item.typeLabel} />,
    },
    {
      id: 'numOfCoveringScenarios',
      label: 'Antall scenarioer',
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

  const data: CoverageTableRow[] = [
    { id: 'a', numOfCoveringScenarios: 4, typeLabel: 'Terroristorganisasjon' },
    { id: 'b', numOfCoveringScenarios: 11, typeLabel: 'Stat' },
    { id: 'c', numOfCoveringScenarios: 0, typeLabel: 'Datasnok' },
    { id: 'd', numOfCoveringScenarios: 5, typeLabel: 'Uheldig ansatt' },
  ];
  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => data,
    paginationOptions: {
      pageSize: 10,
      showPageSizeOptions: false,
    },
  });

  return <Table columnConfig={columns} {...tableProps} />;
}
