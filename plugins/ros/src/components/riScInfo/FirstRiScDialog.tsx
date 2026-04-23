import { Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { CreateNewRiScButton } from './CreateNewRiScButton.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import styles from './ErrorState.module.css';

type FirstRiScDialogProps = {
  onNewRiSc: () => void;
};

export function FirstRiScDialog(props: FirstRiScDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
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
          <div className={styles.actions}>
            <CreateNewRiScButton onCreateNew={props.onNewRiSc} />
          </div>
        </Flex>
      </CardBody>
    </Card>
  );
}
