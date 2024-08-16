import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScenarioTable, ScenarioTableProps } from './ScenarioTable';

export const ScenarioTableWrapper = ({ riSc }: ScenarioTableProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScenarioTable riSc={riSc} />
    </DndProvider>
  );
};
