import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import {
  Card,
  CardBody,
  Text,
  Table,
  useTable,
  type ColumnConfig,
  CellText,
} from '@backstage/ui';
import { useSystemChildComponents } from '../../utils/entityRelations.ts';

export function RiScRelationComponent() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const componentRelations = useSystemChildComponents();
  const columns: ColumnConfig<any>[] = [
    {
      id: 'name',
      label: 'Name',
      isRowHeader: true,
      cell: item => (
        <CellText
          title={item.name}
          href={item.riscUrl}
          leadingIcon={<i className="ri-link" />}
        />
      ),
    },
    { id: 'kind', label: 'Kind', cell: item => <CellText title={item.kind} /> },
  ];

  const { tableProps } = useTable({
    mode: 'complete',
    paginationOptions: {
      pageSize: 5,
      showPageSizeOptions: false,
    },
    getData: () =>
      componentRelations.map(item => ({
        id: item.entityRef,
        ...item,
      })),
  });

  return (
    <>
      {componentRelations.length > 0 && (
        <Card>
          <CardBody>
            <Text
              variant="title-small"
              as="h6"
              weight="bold"
              style={{ marginBottom: '12px' }}
            >
              {t('dictionary.relatedComponents')}
            </Text>
            <Table columnConfig={columns} {...tableProps} />
          </CardBody>
        </Card>
      )}
    </>
  );
}
