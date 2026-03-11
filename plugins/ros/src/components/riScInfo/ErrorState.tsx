import { Card, CardBody, Flex, Text, Button } from '@backstage/ui';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import styles from './ErrorState.module.css';

export function ErrorState() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const refreshPage = () => {
    window.location.reload();
  };
  return (
    <Card className={styles.card}>
      <CardBody>
        <Flex direction="column" align="center">
          <Text variant="body-large">
            {t('errorMessages.FailedToFetchRiScs')}
          </Text>
          <Button onClick={refreshPage}>{t('dictionary.refresh')}</Button>
        </Flex>
      </CardBody>
    </Card>
  );
}
