import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { IconButton, Paper } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useRiScs } from '../../contexts/RiScContext';
import { ActionStatusOptions } from '../../utils/constants';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Scenario } from '../../utils/types';
import {
  deleteScenario,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
} from '../../utils/utilityfunctions';
import { ScenarioTableProgressBar } from './ScenarioTableProgressBar';
import { useTableStyles } from './ScenarioTableStyles';
import { Text } from '@backstage/ui';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
  index: number;
  moveRowFinal: (dragIndex: number, dropIndex: number) => void;
  moveRowLocal: (dragIndex: number, hoverIndex: number) => void;
  isLastRow?: boolean;
  isEditing: boolean;
}

export function ScenarioTableRow({
  scenario,
  viewRow,
  index,
  moveRowFinal,
  moveRowLocal,
  isLastRow,
  isEditing,
}: ScenarioTableRowProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    riskColor,
    rowBackground,
    rowBorder,
    tableCell,
    tableCellTitle,
    tableCellContainer,
  } = useTableStyles();

  const { selectedRiSc: riSc, updateRiSc } = useRiScs();

  const ref = useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop({
    accept: 'row',
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      const isMovingDown =
        dragIndex < hoverIndex && hoverClientY < hoverMiddleY;
      const isMovingUp = dragIndex > hoverIndex && hoverClientY > hoverMiddleY;
      if (isMovingDown || isMovingUp) return;

      moveRowLocal(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'row',
    item: { index, originalIndex: index },

    end: (item, monitor) => {
      if (monitor.didDrop()) {
        const finalIndex = item.index;
        const { originalIndex } = item;

        moveRowFinal(originalIndex, finalIndex);
      }
    },

    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  preview(drop(ref));

  return (
    <TableRow
      ref={ref}
      className={`${isLastRow ? undefined : rowBorder} ${rowBackground}`}
      onClick={() => viewRow(scenario.ID)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {isEditing && (
        <TableCell>
          <IconButton size="small" ref={drag}>
            <DragIndicatorIcon
              aria-label="Drag"
              sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
          </IconButton>
        </TableCell>
      )}
      <TableCell className={tableCellTitle}>
        <Text weight="bold" style={{ color: 'var(--bui-bg-solid)' }}>
          {scenario.title}
        </Text>
      </TableCell>
      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.risk),
            }}
          />
          {t('scenarioTable.columns.probabilityChar')}:
          {getProbabilityLevel(scenario.risk)}{' '}
          {t('scenarioTable.columns.consequenceChar')}:
          {getConsequenceLevel(scenario.risk)}
        </div>
      </TableCell>
      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          {(() => {
            if (scenario.actions.length > 0) {
              return (
                <ScenarioTableProgressBar
                  completedCount={
                    scenario.actions.filter(
                      a => a.status === ActionStatusOptions.OK,
                    ).length
                  }
                  totalCount={
                    scenario.actions.filter(
                      a => a.status !== ActionStatusOptions.NotRelevant,
                    ).length
                  }
                />
              );
            }
            return t('scenarioTable.noActions');
          })()}
        </div>
      </TableCell>
      <TableCell className={tableCell}>
        <div className={tableCellContainer}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
            }}
          />
          {t('scenarioTable.columns.probabilityChar')}:
          {getProbabilityLevel(scenario.remainingRisk)}{' '}
          {t('scenarioTable.columns.consequenceChar')}:
          {getConsequenceLevel(scenario.remainingRisk)}
        </div>
      </TableCell>
      {isEditing && (
        <TableCell>
          <IconButton
            size="small"
            onClick={() => deleteScenario(riSc, updateRiSc, scenario)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}
