import styles from './CoverageStatusBox.module.css';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { CoverageType } from '../../utils/threatActorsAndVulnerabilities.ts';
import { StatusIcon, StatusIconTypes } from '../common/StatusIcon.tsx';
import {
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from '../../utils/constants.ts';

type CoverageStatusBoxProps = {
  notCovered: string[];
  coverageType: CoverageType;
};
function getIconType(count: number): StatusIconTypes {
  if (count === 0) return StatusIconTypes.Green;
  if (count <= 2) return StatusIconTypes.Yellow;
  return StatusIconTypes.Red;
}

export function CoverageStatusBox(props: CoverageStatusBoxProps) {
  const iconType = getIconType(props.notCovered.length);

  return (
    <div className={styles.boxStyle}>
      <StatusIcon type={iconType} size="medium" />
      <Text
        dangerouslySetInnerHTML={{
          __html: useCoverageStatusText(props.notCovered, props.coverageType),
        }}
      />
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

  const translationPrefix =
    coverageType === CoverageType.Vulnerability
      ? 'vulnerabilities'
      : 'threatActors';

  const translated = notCoveredList.map(item =>
    t(
      `${translationPrefix}.${item}` as
        | `threatActors.${ThreatActorsOptions}`
        | `vulnerabilities.${VulnerabilitiesOptions}`,
    ),
  );

  if (numOfNotCovered === 0) {
    return t('threatActorsAndVulnerabilities.allCovered', {
      kind: kindPlural.toLowerCase(),
    });
  }

  if (numOfNotCovered === 1) {
    return t('threatActorsAndVulnerabilities.oneNotCovered', {
      kind: kind,
      notCovered: translated[0],
    });
  }

  if (numOfNotCovered === 2) {
    return t('threatActorsAndVulnerabilities.twoNotCovered', {
      kind: kindsPlural,
      notCovered1: translated[0],
      notCovered2: translated[1],
    });
  }
  return t('threatActorsAndVulnerabilities.multipleNotCovered', {
    kind: kindPlural.toLowerCase(),
    notCovered1: translated[0],
    notCovered2: translated[1],
    notCovered3: translated[2],
  });
}
