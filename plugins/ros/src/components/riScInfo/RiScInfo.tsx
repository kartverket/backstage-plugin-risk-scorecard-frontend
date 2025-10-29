import { RiScWithMetadata } from '../../utils/types';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { useRiScs } from '../../contexts/RiScContext';
import { RiScSelectionCard } from './RiScSelectionCard.tsx';
import { Flex, Text } from '@backstage/ui';
import { CreateNewRiScButton } from './CreateNewRiScButton.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  onCreateNew: () => void;
}

export function RiScInfo({
  riScWithMetadata,
  edit,
  onCreateNew,
}: RiScInfoProps) {
  const { approveRiSc } = useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex direction="column">
      <Flex
        direction="row"
        pr="32px"
        align="center"
        justify="between"
        style={{ width: '50%' }}
      >
        <Text variant="body-large" as="h6" weight="bold">
          {t('contentHeader.multipleRiScs')}
        </Text>
        <CreateNewRiScButton onCreateNew={onCreateNew} />
      </Flex>

      <Flex direction="row" gap="0">
        <Flex direction="column" pr="32px" style={{ flex: '0 0 50%' }}>
          <RiScSelectionCard
            riScWithMetadata={riScWithMetadata}
            edit={edit}
            onCreateNew={onCreateNew}
          />
        </Flex>

        <Flex direction="column" justify="start" style={{ flex: '0 0 50%' }}>
          <RiScStatusComponent
            selectedRiSc={riScWithMetadata}
            publishRiScFn={approveRiSc}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
