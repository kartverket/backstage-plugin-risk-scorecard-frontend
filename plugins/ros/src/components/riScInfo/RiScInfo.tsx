import { RiScWithMetadata } from '../../utils/types';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { useRiScs } from '../../contexts/RiScContext';
import { RiScSelectionCard } from './RiScSelectionCard.tsx';
import { Flex } from '@backstage/ui';

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

  return (
    <Flex direction="row">
      <RiScSelectionCard
        riScWithMetadata={riScWithMetadata}
        edit={edit}
        onCreateNew={onCreateNew}
      />
      <RiScStatusComponent
        selectedRiSc={riScWithMetadata}
        publishRiScFn={approveRiSc}
      />
    </Flex>
  );
}
