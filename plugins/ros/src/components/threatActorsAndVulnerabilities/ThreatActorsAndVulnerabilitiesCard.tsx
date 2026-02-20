import { Button, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { useState } from 'react';
import DialogComponent from '../dialog/DialogComponent.tsx';
import { CoverageTable } from './CoverageTable.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { CoverageRatio } from './CoverageRatio.tsx';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';
import { Scenario } from '../../utils/types.ts';
import { CoverageStatusBox } from './CoverageStatusBox.tsx';

type ThreatActorsAndVulnerabilitiesCardProps = {
  scenarios: Scenario[];
};

export function ThreatActorsAndVulnerabilitiesCard(
  props: ThreatActorsAndVulnerabilitiesCardProps,
) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Card>
      <CardHeader>
        <Text variant="title-small" weight="bold">
          {t('threatActorsAndVulnerabilities.title')}
        </Text>
      </CardHeader>
      <CardBody>
        <Flex direction="column">
          <CoverageStatusBox
            notCovered={[]}
            coverageType={CoverageType.ThreatActor}
          />
          <CoverageStatusBox
            notCovered={['Misconfiguration']}
            coverageType={CoverageType.Vulnerability}
          />
          <CoverageStatusBox
            notCovered={['Script kiddie', 'Insider']}
            coverageType={CoverageType.ThreatActor}
          />
          <CoverageStatusBox
            notCovered={[
              'Excessive use',
              'Information leak',
              'Misconfiguration',
            ]}
            coverageType={CoverageType.Vulnerability}
          />
          <CoverageRatio ratio={'11 av 11'} coverageText="Sårbarheter dekket" />
          <CoverageRatio
            ratio={'17 av 20'}
            coverageText="Trusselaktører dekket"
          />
          <Button
            style={{ width: 'fit-content' }}
            onClick={() => setIsDialogOpen(true)}
          >
            Vis mer informasjon
          </Button>
          <DialogComponent
            header={'Scenarier som dekker sårbarheter og trusselaktører'}
            isOpen={isDialogOpen}
            onClick={() => setIsDialogOpen(false)}
          >
            <Flex direction="column">
              <Text variant="title-x-small">Dekning av sårbarheter</Text>
              <CoverageTable coverageType={CoverageType.Vulnerability} />
              <Text variant="title-x-small">Dekning av trusselaktører</Text>
              <CoverageTable coverageType={CoverageType.ThreatActor} />
            </Flex>
          </DialogComponent>
        </Flex>
      </CardBody>
    </Card>
  );
}
