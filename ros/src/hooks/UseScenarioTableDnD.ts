import { RiScWithMetadata, Scenario } from '../utils/types.ts';
import { RefObject } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useRiScs } from '../contexts/RiScContext.tsx';

export function useScenarioTableDrop(
  index: number,
  id: string,
  setTempScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>,
  ref: RefObject<HTMLDivElement>,
) {
  return useDrop({
    accept: 'row',
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return;

      const dragId = item.id;
      const hoverId = id;

      if (dragId === hoverId) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      const buffer = hoverBoundingRect.height * 0.05;
      if (item.index < index && hoverClientY < hoverMiddleY - buffer) return;
      if (item.index > index && hoverClientY > hoverMiddleY + buffer) return;

      moveRowLocal(dragId, hoverId!, setTempScenarios);

      item.index = index;
    },
    drop() {
      return { moved: true };
    },
  });
}

export function useScenarioTableDrag(
  index: number,
  id: string,
  setTempScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>,
  riSc: RiScWithMetadata,
) {
  const { updateRiSc } = useRiScs();
  return useDrag(() => ({
    type: 'row',
    item: { id, index },

    end: (item, monitor) => {
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult() as {
          moved?: boolean;
        } | null;
        if (dropResult?.moved && item.id && id) {
          moveRowFinal(item.id, id, setTempScenarios, riSc, updateRiSc);
        }
      }
    },

    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));
}

function moveRowLocal(
  dragId: string,
  hoverId: string,
  setTempScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>,
) {
  setTempScenarios(prev => {
    const dragIndex = prev.findIndex(s => s.ID === dragId);
    const hoverIndex = prev.findIndex(s => s.ID === hoverId);

    if (dragIndex === -1 || hoverIndex === -1) return prev;

    const updated = [...prev];
    const [removed] = updated.splice(dragIndex, 1);

    updated.splice(hoverIndex, 0, removed);
    return updated;
  });
}

function moveRowFinal(
  dragId: string,
  dropId: string,
  setTempScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>,
  riSc: RiScWithMetadata,
  updateRiSc: (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void,
) {
  setTempScenarios(prev => {
    const dragIndex = prev.findIndex(item => item.ID === dragId);
    const dropIndex = prev.findIndex(item => item.ID === dropId);

    if (dragIndex === -1 || dropIndex === -1) return prev;

    const updatedScenarios = [...prev];
    const [removed] = updatedScenarios.splice(dragIndex, 1);
    updatedScenarios.splice(dropIndex, 0, removed);

    const updatedRiSc = {
      ...riSc,
      content: {
        ...riSc.content,
        scenarios: updatedScenarios,
      },
    };
    updateRiSc(updatedRiSc, () => {});
    return updatedScenarios;
  });
}
