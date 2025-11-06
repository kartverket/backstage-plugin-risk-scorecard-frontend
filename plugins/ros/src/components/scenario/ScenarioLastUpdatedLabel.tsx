import { Flex, Text } from '@backstage/ui';
import { formatDate } from '../../utils/utilityfunctions.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import styles from './ScenarioLastUpdatedLabel.module.css';

type ScenarioLastUpdatedLabelProps = {
  lastUpdated?: Date | undefined | null;
  lastUpdatedBy?: string | undefined | null;
};

export function ScenarioLastUpdatedLabel(props: ScenarioLastUpdatedLabelProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const parsedDateTime = props.lastUpdated
    ? formatDate(props.lastUpdated)
    : t('scenarioDrawer.action.notUpdated');

  return (
    <Flex direction="column" gap="0">
      <Text as="p" variant="body-medium">
        {t('scenarioDrawer.action.lastUpdated')} {parsedDateTime}
      </Text>
      <Text variant="body-medium" className={styles.textGray}>
        {props.lastUpdatedBy
          ? `${t('dictionary.by')} ${props.lastUpdatedBy}`
          : `${t('dictionary.by')} ${t('dictionary.unknown')}`}
      </Text>
    </Flex>
  );
}
