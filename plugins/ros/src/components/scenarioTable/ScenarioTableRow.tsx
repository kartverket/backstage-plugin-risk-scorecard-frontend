import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { IconButton, Paper } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState, useRef, useEffect } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Scenario } from '../../utils/types';
import { useRiScs } from '../../contexts/RiScContext';
import {
  deleteScenario,
  getConsequenceLevel,
  getProbabilityLevel,
  getRiskMatrixColor,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { ScenarioTableProgressBar } from './ScenarioTableProgressBar';
import { useTableStyles } from './ScenarioTableStyles';
import { Text, Flex, Card } from '@backstage/ui';
import { DeleteScenarioConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { ActionStatusOptions } from '../../utils/constants';
import { useDrag, useDrop } from 'react-dnd';
import { ActionsCard } from './ActionsCard.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { useTheme } from '@mui/material/styles';
import {
  getActionsWithUpdatedStatus,
  getFilteredActions,
} from '../../utils/actions.ts';

interface ScenarioTableRowProps {
  scenario: Scenario;
  viewRow: (id: string) => void;
  id: string;
  index: number;
  moveRowFinal: (dragId: string, dropId: string) => void;
  moveRowLocal: (dragId: string, hoverId: string) => void;
  isEditing: boolean;
  visibleType: UpdatedStatusEnumType | null;
  allowDrag?: boolean;
  searchMatches?: Scenario['actions'];
}

export function ScenarioTableRow({
  scenario,
  viewRow,
  id,
  index,
  moveRowFinal,
  moveRowLocal,
  isEditing,
  visibleType,
  allowDrag = true,
  searchMatches,
}: ScenarioTableRowProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const theme = useTheme();
  const { tableCard, riskColor, noHover } = useTableStyles();
  const [isChildHover, setIsChildHover] = useState(false);

  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { hoveredScenarios } = useScenario();
  const [isScenarioDeletionDialogOpen, setScenarioDeletionDialogOpen] =
    useState(false);

  const [actionIdsOfVisibleType, setActionIdsOfVisibleType] = useState<
    string[]
  >([]);

  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
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

      moveRowLocal(dragId, hoverId!);

      item.index = index;
    },
    drop() {
      return { moved: true };
    },
  });

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'row',
    item: { id, index },

    end: (item, monitor) => {
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult() as {
          moved?: boolean;
        } | null;
        if (dropResult?.moved && item.id && id) {
          moveRowFinal(item.id, id);
        }
      }
    },

    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const actionsWithUpdatedStatus = getActionsWithUpdatedStatus(
    scenario.actions,
    riSc?.lastPublished?.numberOfCommits || null,
  );
  const filteredActions = getFilteredActions(
    actionsWithUpdatedStatus,
    searchMatches,
    actionIdsOfVisibleType,
    visibleType,
  );

  useEffect(() => {
    const actions = actionsWithUpdatedStatus.filter(
      a => a.updatedStatus === visibleType,
    );
    const actionIds = actions.map(a => a.ID);
    setActionIdsOfVisibleType(actionIds);
  }, [visibleType]);

  preview(drop(ref));

  const isScenarioHoveredFromRiskMatrix = hoveredScenarios.some(
    s => s.ID === scenario.ID,
  );
  const isTextColorBlack =
    theme.palette.mode === 'dark' ? isScenarioHoveredFromRiskMatrix : true;
  const textColorAsBuiVariable = isTextColorBlack
    ? 'var(--bui-black)'
    : 'var(--bui-white)';

  return (
    <Card
      ref={ref}
      onClick={() => viewRow(scenario.ID)}
      className={`${tableCard} ${isChildHover ? noHover : ''}`}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: isDragging ? 'none' : undefined,
        backgroundColor: isScenarioHoveredFromRiskMatrix ? '#FFDD9D' : '',
      }}
    >
      <Flex align="center">
        {isEditing && allowDrag && (
          <IconButton size="small" ref={drag}>
            <DragIndicatorIcon
              sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
          </IconButton>
        )}
        <Text
          as="p"
          variant="body-large"
          weight="bold"
          style={{ width: '35%', color: textColorAsBuiVariable }}
        >
          {scenario.title}
        </Text>
        <Flex align="center" justify="start" style={{ width: '15%' }}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.risk),
            }}
          />
          <Text variant="body-medium" style={{ color: textColorAsBuiVariable }}>
            {t('scenarioTable.columns.probabilityChar')}:
            {`${getProbabilityLevel(
              scenario.risk,
            )} ${t('scenarioTable.columns.consequenceChar')}:${getConsequenceLevel(scenario.risk)}`}
          </Text>
        </Flex>

        <Flex
          align="center"
          justify="start"
          style={{ width: isEditing ? '30%' : '35%' }}
        >
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
                  textColor={textColorAsBuiVariable}
                />
              );
            }
            return (
              <Text style={{ color: textColorAsBuiVariable }}>
                {t('scenarioTable.noActions')}
              </Text>
            );
          })()}
        </Flex>
        <Flex align="center" style={{ width: '15%' }}>
          <Paper
            className={riskColor}
            style={{
              backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
            }}
          />
          <Text
            variant="body-medium"
            style={{ color: textColorAsBuiVariable }}
          >{`${t('scenarioTable.columns.probabilityChar')}:${getProbabilityLevel(
            scenario.remainingRisk,
          )} ${t('scenarioTable.columns.consequenceChar')}:${getConsequenceLevel(scenario.remainingRisk)}`}</Text>
        </Flex>

        {isEditing && (
          <Flex align="center" justify="end">
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
          </Flex>
        )}
      </Flex>
      {filteredActions.length > 0 && (
        <div
          onMouseEnter={() => setIsChildHover(true)}
          onMouseLeave={() => setIsChildHover(false)}
        >
          <ActionsCard
            filteredData={filteredActions}
            scenario={scenario}
            showUpdatedBadge={!!visibleType}
          />
        </div>
      )}
    </Card>
  );
}
