import { Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { LockedRiSc } from '../../utils/types';
import styles from './ErrorState.module.css';

type LockedRiScViewProps = {
  lockedRiSc: LockedRiSc;
};

export function LockedRiScView({ lockedRiSc }: LockedRiScViewProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const keyId =
    lockedRiSc.encryptionKeyId?.split('/').pop() ??
    lockedRiSc.encryptionKeyId;

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
        >
          <Text>{t('lockedRiScCard.description', { keyId: keyId ?? '' })}</Text>
        </Flex>
      </CardBody>
    </Card>
  );
}
