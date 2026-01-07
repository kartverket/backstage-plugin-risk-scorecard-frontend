import { Flex, Text } from '@backstage/ui';
import { formatDate, shortenName } from '../../utils/utilityfunctions.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import styles from './ScenarioLastUpdatedLabel.module.css';

type ScenarioLastUpdatedLabelProps = {
  lastUpdated?: Date | undefined | null;
  lastUpdatedBy?: string | undefined | null;
};

export function ScenarioLastUpdatedLabel(props: ScenarioLastUpdatedLabelProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const parsedLastUpdated = props.lastUpdated
    ? formatDate(props.lastUpdated)
    : t('scenarioDrawer.action.notUpdated');

  const totalLabelWidth =
    t('currentLanguage') === 'en' ? `${144 + 8}px` : `${169 + 8}px`;

  return (
    <Flex direction="column" gap="0" style={{ width: totalLabelWidth }}>
      <Text as="p" variant="body-medium">
        {t('scenarioDrawer.action.lastUpdated')} {parsedLastUpdated}
      </Text>
      {props.lastUpdatedBy && (
        <Text variant="body-medium" className={styles.textGray}>
          {t('dictionary.by')} {shortenName(props.lastUpdatedBy, 16)}
        </Text>
      )}
    </Flex>
  );
}
