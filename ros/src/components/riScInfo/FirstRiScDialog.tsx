import { Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import { CreateNewRiScButton } from './CreateNewRiScButton.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type FirstRiScDialogProps = {
  onNewRiSc: () => void;
};

export function FirstRiScDialog(props: FirstRiScDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Card
      style={{
        width: '520px',
      }}
    >
      <CardHeader>
        <Flex justify="center">
          <Text variant="title-small" weight="bold">
            {t('firstRiScCard.noRiScYet')}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction="column" align="center">
          <Text>{t('firstRiScCard.getStarted')}</Text>
          <CreateNewRiScButton onCreateNew={props.onNewRiSc} />
        </Flex>
      </CardBody>
    </Card>
  );
}
