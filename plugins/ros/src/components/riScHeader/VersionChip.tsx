import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

interface VersionChipProps {
  versionInfo?: string;
}

export function VersionChip({ versionInfo }: VersionChipProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (!versionInfo) {
    return null;
  }

  return (
    <div
      style={{
        padding: 'var(--bui-space-1_5)',
        boxShadow: 'inset 0 0 0 1px var(--bui-border)', // same as bui secondary button
        borderRadius: 'var(--bui-radius-2)', // same as bui secondary button
      }}
    >
      <Text weight="bold">
        {t('dictionary.version')} {versionInfo}
      </Text>
    </div>
  );
}
