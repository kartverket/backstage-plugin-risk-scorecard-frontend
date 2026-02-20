import { Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';

type CoverageRatioProps = {
  covered: number;
  total: number;
  coverageType: CoverageType;
};

export function CoverageRatio(props: CoverageRatioProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const label =
    props.coverageType === CoverageType.Vulnerability
      ? t('threatActorsAndVulnerabilities.vulnerabilityCoverage')
      : t('threatActorsAndVulnerabilities.threatActorCoverage');

  return (
    <Flex align="center">
      <Text variant="body-large" style={{ width: '162px' }}>
        {label}:
      </Text>
      <Text variant="title-x-small" weight="bold">
        {t('threatActorsAndVulnerabilities.coverageRatio', {
          covered: props.covered.toString(),
          total: props.total.toString(),
        })}
      </Text>
    </Flex>
  );
}
