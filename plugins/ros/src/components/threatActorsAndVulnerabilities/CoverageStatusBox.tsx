import styles from './CoverageStatusBox.module.css';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';
import { StatusIcon, StatusIconTypes } from '../common/StatusIcon.tsx';

type CoverageStatusBoxProps = {
  notCovered: string[];
  coverageType: CoverageType;
};
export function CoverageStatusBox(props: CoverageStatusBoxProps) {
  return (
    <div className={styles.boxStyle}>
      <StatusIcon type={StatusIconTypes.Green} />
      <Text
        dangerouslySetInnerHTML={{
          __html: useCoverageStatusText(props.notCovered, props.coverageType),
        }}
      ></Text>
    </div>
  );
}

function useCoverageStatusText(
  notCoveredList: string[],
  coverageType: CoverageType,
) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const numOfNotCovered = notCoveredList.length;

  const kindPlural =
    coverageType === CoverageType.Vulnerability
      ? t('dictionary.vulnerabilities')
      : t('dictionary.threatActors');

  const kindsPlural =
    coverageType === CoverageType.Vulnerability
      ? t('dictionary.theVulnerabilities')
      : t('dictionary.theThreatActors');

  const kind =
    coverageType === CoverageType.Vulnerability
      ? t('dictionary.theVulnerability')
      : t('dictionary.theThreatActor');

  if (numOfNotCovered === 0) {
    return t('threatActorsAndVulnerabilities.allCovered', {
      kind: kindPlural.toLowerCase(),
    });
  }

  if (numOfNotCovered === 1) {
    return t('threatActorsAndVulnerabilities.oneNotCovered', {
      kind: kind,
      notCovered: notCoveredList[0],
    });
  }

  if (numOfNotCovered === 2) {
    return t('threatActorsAndVulnerabilities.twoNotCovered', {
      kind: kindsPlural,
      notCovered1: notCoveredList[0],
      notCovered2: notCoveredList[1],
    });
  }
  return t('threatActorsAndVulnerabilities.multipleNotCovered', {
    kind: kindPlural.toLowerCase(),
    notCovered1: notCoveredList[0],
    notCovered2: notCoveredList[1],
    notCovered3: notCoveredList[2],
  });
}
