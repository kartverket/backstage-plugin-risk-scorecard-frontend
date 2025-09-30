import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useContext } from 'react';
import { PluginVersionContext } from '../../contexts/PluginVersionContext.tsx';

export function VersionChip() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const version = useContext(PluginVersionContext);
  return (
    <div
      style={{
        padding: '4px',
        boxShadow: 'inset 0 0 0 1px var(--bui-border)', // same as bui secondary button
        borderRadius: 'var(--bui-radius-2)', // same as bui secondary button
      }}
    >
      <Text weight="bold">
        {t('dictionary.version')} {version}
      </Text>
    </div>
  );
}
