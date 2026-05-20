import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { LockedRiSc } from '../../utils/types';
import styles from './LockedRiScView.module.css';

type LockedRiScViewProps = {
  lockedRiSc: LockedRiSc;
};

export function LockedRiScView({ lockedRiSc }: LockedRiScViewProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [copied, setCopied] = useState(false);

  const keyId =
    lockedRiSc.encryptionKeyId?.split('/').pop() ??
    lockedRiSc.encryptionKeyId ??
    '';

  const handleCopy = () => {
    navigator.clipboard.writeText(keyId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex justify="center">
          <Text variant="title-small" weight="bold">
            {t('lockedRiScCard.title')}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex
          direction="column"
          align="center"
          gap="8px"
          className={styles.content}
          style={{ padding: '8px 0' }}
        >
          <Text>{t('lockedRiScCard.description')}</Text>
          {keyId && (
            <Flex direction="column" align="center" gap="4px">
              <Text>{t('lockedRiScCard.encryptedWithKey')}</Text>
              <Flex align="center" gap="8px">
                <Text weight="bold">{keyId}</Text>
                <Button
                  variant="tertiary"
                  size="small"
                  iconStart={
                    <i
                      className={copied ? 'ri-check-line' : 'ri-file-copy-line'}
                    />
                  }
                  onClick={handleCopy}
                >
                  {copied ? t('dictionary.copied') : t('dictionary.copy')}
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}
