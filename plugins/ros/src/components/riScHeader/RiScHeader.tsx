import { Flex, Text } from '@backstage/ui';
import { EditEncryptionButton } from '../riScDialog/EditEncryptionButton.tsx';
import { SupportDialog } from '../riScDialog/SupportDialog.tsx';
import { FeedbackDialog } from '../riScPlugin/FeedbackDialog.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type RiScHeaderProps = {
  onEditEncryption: () => void;
};

export function RiScHeader(props: RiScHeaderProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <header style={{ position: 'relative' }}>
      <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
        <Text variant="title-medium" weight="bold">
          {t('contentHeader.title')}
        </Text>
        <Flex>
          <EditEncryptionButton onEditEncryption={props.onEditEncryption} />
          <SupportDialog />
          <FeedbackDialog />
        </Flex>
      </Flex>
    </header>
  );
}
