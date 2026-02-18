import { Button, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { useState } from 'react';
import DialogComponent from '../dialog/DialogComponent.tsx';
import { CoverageTable, CoverageType } from './CoverageTable.tsx';
import styles from './ThreatActorsAndVulnerabilitiesCard.module.css';

/*
type ThreatActorsAndVulnerabilitiesCardProps = {
  scenarios: Scenario[];
};

 */
export function ThreatActorsAndVulnerabilitiesCard() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  return (
    <Card>
      <CardHeader>
        <Text variant="title-small" weight="bold">
          Trusselaktører og sårbarheter
        </Text>
      </CardHeader>
      <CardBody>
        <Flex direction="column">
          <div className={styles.boxStyle}>
            ✅ Alle sårbarheter er dekket i minst ett scenario
          </div>
          <div className={styles.boxStyle}>
            ⚠️ 3 trusselaktører er ikke dekket. Disse inkluderer{' '}
            <b>Hacktivist</b>, <b>terroristorganisasjon</b>, og <b>stat</b>.
          </div>
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
              <CoverageTable coverageType={CoverageType.VULNERABILITIES} />
              <Text variant="title-x-small">Dekning av trusselaktører</Text>
              <CoverageTable coverageType={CoverageType.THREAT_ACTORS} />
            </Flex>
          </DialogComponent>
        </Flex>
      </CardBody>
    </Card>
  );
}

function CoverageRatio(props: { ratio: string; coverageText: string }) {
  return (
    <Flex align="center">
      <Text variant="body-large" style={{ width: '162px' }}>
        {props.coverageText}:
      </Text>
      <Text variant="title-x-small" weight="bold">
        {props.ratio}
      </Text>
    </Flex>
  );
}
