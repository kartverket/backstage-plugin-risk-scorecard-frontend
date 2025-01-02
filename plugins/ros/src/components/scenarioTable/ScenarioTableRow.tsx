import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IconButton, Paper, Typography } from '@material-ui/core';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Scenario } from '../../utils/types';
import { useTableStyles } from './ScenarioTableStyles';
import {
  deleteScenario,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
} from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRiScs } from '../../contexts/RiScContext';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  isLastRow?: boolean;
  edit: boolean;
}

export const ScenarioTableRow = ({
  scenario,
  viewRow,
  index,
  moveRow,
  isLastRow,
  edit,
}: ScenarioTableRowProps) => {
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
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'row',
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  const remainingActions = scenario.actions.filter(
    a => a.status !== 'Completed',
  );

  return (
    <TableRow
      ref={ref}
      className={`${isLastRow ? undefined : rowBorder} ${rowBackground}`}
      onClick={() => viewRow(scenario.ID)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {edit && (
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
        <Typography color="primary" style={{ fontWeight: 600 }}>
          {scenario.title}
        </Typography>
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
            if (remainingActions.length > 0) {
              return (
                <>
                  {remainingActions.length}{' '}
                  {t('dictionary.planned').toLowerCase()}
                </>
              );
            }

            if (scenario.actions.length > 0) {
              return t('dictionary.completed');
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
      {edit && (
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
};
