import { Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

export function ScenarioTableCardHeader() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Flex justify="between">
      <Text variant="title-small" as="h6" weight="bold">
        {t('scenarioTable.title')}
      </Text>
    </Flex>
  );
}
