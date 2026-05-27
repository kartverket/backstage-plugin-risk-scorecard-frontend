import { Card, CardBody, CardHeader, Flex, Text, Button } from '@backstage/ui';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import styles from './ErrorState.module.css';
import { CreateNewRiScButton } from './CreateNewRiScButton';

type ErrorStateProps = {
  onCreateNew: () => void;
};

export function ErrorState({ onCreateNew }: ErrorStateProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex justify="center">
          <Text variant="title-small" weight="bold">
            {t('firstRiScCard.noRiScYet')}
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
          <Text>{t('firstRiScCard.getStarted')}</Text>
          <Flex gap="12px" className={styles.actions}>
            <Button onClick={refreshPage} className={styles.reloadButton}>
              <i className="ri-refresh-line" />
              {t('dictionary.refresh')}
            </Button>
            <CreateNewRiScButton onCreateNew={onCreateNew} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}
