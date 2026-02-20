import { Button, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { useState } from 'react';
import DialogComponent from '../dialog/DialogComponent.tsx';
import { CoverageTable } from './CoverageTable.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { CoverageRatio } from './CoverageRatio.tsx';
import {
  CoverageType,
  countScenarioCoverage,
  countScenarioCoverageSummary,
  getNotCovered,
} from '../../utils/threatActorsAndVulnerabilities.ts';
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

  const coverage = countScenarioCoverage(props.scenarios);
  const summary = countScenarioCoverageSummary(props.scenarios);

  const notCoveredThreatActors = getNotCovered(coverage.threatActors);
  const notCoveredVulnerabilities = getNotCovered(coverage.vulnerabilities);

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
            notCovered={notCoveredThreatActors}
            coverageType={CoverageType.ThreatActor}
          />
          <CoverageStatusBox
            notCovered={notCoveredVulnerabilities}
            coverageType={CoverageType.Vulnerability}
          />
          <CoverageRatio
            covered={summary.vulnerabilities.covered}
            total={summary.vulnerabilities.total}
            coverageType={CoverageType.Vulnerability}
          />
          <CoverageRatio
            covered={summary.threatActors.covered}
            total={summary.threatActors.total}
            coverageType={CoverageType.ThreatActor}
          />
          <Button
            style={{ width: 'fit-content' }}
            onClick={() => setIsDialogOpen(true)}
          >
            {t('threatActorsAndVulnerabilities.showMoreInfo')}
          </Button>
          <DialogComponent
            header={t('threatActorsAndVulnerabilities.dialogHeader')}
            isOpen={isDialogOpen}
            onClick={() => setIsDialogOpen(false)}
          >
            <Flex direction="column">
              <Text variant="title-x-small">
                {t('threatActorsAndVulnerabilities.vulnerabilityCoverage')}
              </Text>
              <CoverageTable
                coverageType={CoverageType.Vulnerability}
                coverageMap={coverage.vulnerabilities}
              />
              <Text variant="title-x-small">
                {t('threatActorsAndVulnerabilities.threatActorCoverage')}
              </Text>
              <CoverageTable
                coverageType={CoverageType.ThreatActor}
                coverageMap={coverage.threatActors}
              />
            </Flex>
          </DialogComponent>
        </Flex>
      </CardBody>
    </Card>
  );
}
