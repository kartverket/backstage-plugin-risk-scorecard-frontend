import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { IconButton, Paper } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState, useRef } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Scenario, Action } from '../../utils/types';
import { useRiScs } from '../../contexts/RiScContext';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  deleteScenario,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { ScenarioTableProgressBar } from './ScenarioTableProgressBar';
import { useTableStyles } from './ScenarioTableStyles';
import { Text, Flex, Card, Grid } from '@backstage/ui';
import { DeleteScenarioConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { ActionStatusOptions } from '../../utils/constants';
import { useDrag, useDrop } from 'react-dnd';
import { ActionsCard } from './ActionsCard.tsx';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
  index: number;
  moveRowFinal: (dragIndex: number, dropIndex: number) => void;
  moveRowLocal: (dragIndex: number, hoverIndex: number) => void;
  isEditing: boolean;
  visibleType: UpdatedStatusEnumType | null;
}

export function ScenarioTableRow({
  scenario,
  viewRow,
  index,
  moveRowFinal,
  moveRowLocal,
  isEditing,
  visibleType,
}: ScenarioTableRowProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { tableCard, gridItem, riskColor } = useTableStyles();

  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const [isScenarioDeletionDialogOpen, setScenarioDeletionDialogOpen] =
    useState(false);

  const ref = useRef<HTMLDivElement>(null);

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

  const actionsWithUpdatedStatus = scenario.actions.map(action => {
    const daysSinceLastUpdate = action.lastUpdated
      ? calculateDaysSince(new Date(action.lastUpdated))
      : null;

    return {
      ...action,
      updatedStatus: calculateUpdatedStatus(
        daysSinceLastUpdate,
        riSc?.lastPublished?.numberOfCommits || null,
      ),
    } as Action & { updatedStatus: UpdatedStatusEnumType };
  });

  const filteredActions =
    visibleType === null
      ? []
      : actionsWithUpdatedStatus.filter(a => a.updatedStatus === visibleType);

  preview(drop(ref));

  return (
    <Card
      ref={ref}
      onClick={() => viewRow(scenario.ID)}
      className={tableCard}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Grid.Root columns={`${isEditing ? 9 : 7}`}>
        {isEditing && (
          <Grid.Item className={gridItem}>
            <IconButton size="small" ref={drag}>
              <DragIndicatorIcon
                sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              />
            </IconButton>
          </Grid.Item>
        )}
        <Grid.Item colSpan="3" className={gridItem}>
          <Text as="p" variant="body-large" weight="bold">
            {scenario.title}
          </Text>
        </Grid.Item>
        <Grid.Item colSpan="1" className={gridItem}>
          <Flex align="center" justify="start">
            <Paper
              className={riskColor}
              style={{
                backgroundColor: getRiskMatrixColor(scenario.risk),
              }}
            />
            <Text variant="body-medium">
              {t('scenarioTable.columns.probabilityChar')}:
              {`${getProbabilityLevel(
                scenario.risk,
              )} ${t('scenarioTable.columns.consequenceChar')}:${getConsequenceLevel(scenario.risk)}`}
            </Text>
          </Flex>
        </Grid.Item>

        <Grid.Item colSpan="2" className={gridItem}>
          <div style={{ paddingRight: '1rem' }}>
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
        </Grid.Item>
        <Grid.Item colSpan="1" className={gridItem}>
          <Flex align="center">
            <Paper
              className={riskColor}
              style={{
                backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
              }}
            />
            <Text variant="body-medium">{`${t('scenarioTable.columns.probabilityChar')}:${getProbabilityLevel(
              scenario.remainingRisk,
            )} ${t('scenarioTable.columns.consequenceChar')}:${getConsequenceLevel(scenario.remainingRisk)}`}</Text>
          </Flex>
        </Grid.Item>
        {isEditing && (
          <Grid.Item colSpan="1" className={gridItem}>
            <IconButton
              size="small"
              onClick={event => {
                event.stopPropagation();
                setScenarioDeletionDialogOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
            <DeleteScenarioConfirmation
              isOpen={isScenarioDeletionDialogOpen}
              setIsOpen={setScenarioDeletionDialogOpen}
              onConfirm={() => deleteScenario(riSc, updateRiSc, scenario)}
            />
          </Grid.Item>
        )}
      </Grid.Root>
      {filteredActions.length > 0 && (
        <ActionsCard
          filteredData={filteredActions}
          scenario={scenario}
          updateRiSc={updateRiSc}
        />
      )}
    </Card>
  );
}
