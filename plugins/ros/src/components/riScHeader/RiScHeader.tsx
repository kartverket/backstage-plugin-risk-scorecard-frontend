import { Flex, Text } from '@backstage/ui';
import { EditEncryptionButton } from '../riScDialog/EditEncryptionButton.tsx';
import { SupportDialog } from '../riScDialog/SupportDialog.tsx';
import { FeedbackDialog } from '../riScPlugin/FeedbackDialog.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { VersionChip } from './VersionChip.tsx';

type RiScHeaderProps = {
  onEditEncryption: () => void;
};

export function RiScHeader(props: RiScHeaderProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <header style={{ position: 'relative' }}>
      <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
        <Flex align="center">
          <Text variant="title-medium" weight="bold">
            {t('contentHeader.title')}
          </Text>
          <VersionChip />
        </Flex>
        <Flex style={{ gap: '8px' }}>
          <EditEncryptionButton onEditEncryption={props.onEditEncryption} />
          <SupportDialog />
          <FeedbackDialog />
        </Flex>
      </Flex>
    </header>
  );
}
