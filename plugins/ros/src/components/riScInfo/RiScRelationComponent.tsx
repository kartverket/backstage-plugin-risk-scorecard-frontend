import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import {
  Card,
  CardBody,
  Text,
  Table,
  TableHeader,
  Column,
  TableBody,
  Cell,
  Row,
} from '@backstage/ui';
import { useComponentRelations } from '../../utils/entityRelations.ts';

export function RiScRelationComponent() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const componentRelations = useComponentRelations();

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
            <Table aria-label="Related Components">
              <TableHeader>
                <Column isRowHeader>Name</Column>
                <Column>Kind</Column>
              </TableHeader>
              <TableBody>
                {componentRelations.map((comp, index) => (
                  <Row key={index}>
                    <Cell
                      title={comp.name}
                      leadingIcon={<i className="ri-link" />}
                      href={comp.riscUrl}
                    />
                    <Cell title={comp.kind} />
                  </Row>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </>
  );
}
