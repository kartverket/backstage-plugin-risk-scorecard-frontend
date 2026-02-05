import { Radio, RadioGroup, Text } from '@backstage/ui';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import styles from './GcpCryptoKeyRadioGroup.module.css';

interface GcpCryptoKeyRadioGroupProps {
  chosenGcpCryptoKey: GcpCryptoKeyObject | undefined;
  onChange: (gcpCryptoKey: GcpCryptoKeyObject) => void;
  gcpCryptoKeys: GcpCryptoKeyObject[];
}

export function GcpCryptoKeyRadioGroup({
  chosenGcpCryptoKey,
  onChange,
  gcpCryptoKeys,
}: GcpCryptoKeyRadioGroupProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  // Handle radio change
  function handleChange(resourceId: string | undefined) {
    if (!resourceId) return;

    const selectedKey = gcpCryptoKeys.find(
      key => key.resourceId === resourceId,
    );
    if (selectedKey) {
      onChange(selectedKey);
    }
  }
  return (
    <>
      {gcpCryptoKeys.length === 0 && (
        <Text>{t('sopsConfigDialog.gcpCryptoKeyNoSelectableKey')}</Text>
      )}

      {gcpCryptoKeys.length > 0 && (
        <>
          <Text className={styles.description}>
            {t('sopsConfigDialog.gcpCryptoKeyDescription')}
          </Text>
          <RadioGroup
            onChange={handleChange}
            value={chosenGcpCryptoKey?.resourceId}
            aria-label={t('sopsConfigDialog.chooseGcpCryptoKey')}
          >
            {gcpCryptoKeys.map(key => {
              const permissions = key.userPermissions
                .map(permission =>
                  t(`sopsConfigDialog.cryptoKeyPermission${permission}`),
                )
                .join(', ');
              return (
                <Radio
                  key={key.resourceId}
                  value={key.resourceId}
                  className={styles.radioItem}
                >
                  <Text>
                    {key.name}
                    <Text variant="body-small">
                      {' '}
                      {t('sopsConfigDialog.cryptoKeyOptionInfo', {
                        projectId: key.projectId,
                        permissions: permissions,
                      })}
                    </Text>
                  </Text>
                </Radio>
              );
            })}
          </RadioGroup>
        </>
      )}
    </>
  );
}
