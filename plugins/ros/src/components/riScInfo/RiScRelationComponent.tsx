import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import {
  Card,
  CardBody,
  Text,
  TableHeader,
  Column,
  TableBody,
  CellText,
  Row,
  TableRoot,
} from '@backstage/ui';
import { useSystemChildComponents } from '../../utils/entityRelations.ts';

export function RiScRelationComponent() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const componentRelations = useSystemChildComponents();

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
            <TableRoot aria-label="Related Components">
              <TableHeader>
                <Column isRowHeader>Name</Column>
                <Column>Kind</Column>
              </TableHeader>
              <TableBody>
                {componentRelations.map(comp => (
                  <Row key={comp.entityRef}>
                    <CellText
                      title={comp.name}
                      leadingIcon={<i className="ri-link" />}
                      href={comp.riscUrl}
                    />
                    <CellText title={comp.kind} />
                  </Row>
                ))}
              </TableBody>
            </TableRoot>
          </CardBody>
        </Card>
      )}
    </>
  );
}
