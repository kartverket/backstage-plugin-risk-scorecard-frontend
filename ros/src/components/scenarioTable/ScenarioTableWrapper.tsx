import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScenarioTableCard } from './ScenarioTableCard.tsx';

interface ScenarioTableWrapperProps {
  riScWithMetadata: RiScWithMetadata;
}

export function ScenarioTableWrapper({
  riScWithMetadata,
}: ScenarioTableWrapperProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScenarioTableCard
        editingAllowed={
          riScWithMetadata.status !== RiScStatus.DeletionDraft &&
          riScWithMetadata.status !== RiScStatus.DeletionSentForApproval
        }
        key={riScWithMetadata.id}
        riScWithMetadata={riScWithMetadata}
      />
    </DndProvider>
  );
}
