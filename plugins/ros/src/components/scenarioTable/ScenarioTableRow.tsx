import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Collapse, IconButton } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useState, useRef, useEffect, useMemo, MouseEvent } from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Scenario } from '../../utils/types';
import { useRiScs } from '../../contexts/RiScContext';
import {
  deleteScenario,
  findConsequenceIndex,
  findProbabilityIndex,
  getConsequenceLevel,
  getProbabilityLevel,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { ScenarioTableProgressBar } from './ScenarioTableProgressBar';
import { useTableStyles } from './ScenarioTableStyles';
import { Text, Flex, Card } from '@backstage/ui';
import { DeleteScenarioConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { ActionStatusOptions } from '../../utils/constants';
import { useDrag, useDrop } from 'react-dnd';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { useTheme } from '@mui/material/styles';
import {
  getActionsWithUpdatedStatus,
  getFilteredActions,
} from '../../utils/actions.ts';
import { ActionRowList } from '../action/ActionRowList.tsx';
import { RiskMatrixSquare } from '../riskMatrix/RiskMatrixSquare.tsx';

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
  const { tableCard, tableCardNoHover } = useTableStyles();

  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { hoveredScenarios, setHoveredScenarios } = useScenario();
  const [isScenarioDeletionDialogOpen, setScenarioDeletionDialogOpen] =
    useState(false);

  const [actionIdsOfVisibleType, setActionIdsOfVisibleType] = useState<
    string[]
  >([]);

  const [isExpanded, setIsExpanded] = useState(false);

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

  const actionsWithUpdatedStatus = useMemo(
    () => getActionsWithUpdatedStatus(scenario.actions),
    [scenario.actions],
  );

  const filteredActions = useMemo(
    () =>
      getFilteredActions(
        actionsWithUpdatedStatus,
        searchMatches,
        actionIdsOfVisibleType,
        visibleType,
      ),
    [
      actionsWithUpdatedStatus,
      searchMatches,
      actionIdsOfVisibleType,
      visibleType,
    ],
  );

  useEffect(() => {
    if (visibleType || isExpanded) {
      setHoveredScenarios(prev => prev.filter(s => s.ID !== scenario.ID));
    }
    // only run when visibleType or expansion changes for this scenario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleType, isExpanded]);

  useEffect(() => {
    const actions = actionsWithUpdatedStatus.filter(
      a => a.updatedStatus === visibleType,
    );
    const actionIds = actions.map(a => a.ID);
    setActionIdsOfVisibleType(actionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleType]);

  preview(drop(ref));

  const isScenarioHoveredFromRiskMatrix = hoveredScenarios.some(
    s => s.ID === scenario.ID,
  );
  const highlightColor =
    theme.palette.mode === 'dark'
      ? 'var(--ros-gray-300)'
      : 'var(--ros-gray-100)';
  const isTextColorBlack =
    theme.palette.mode === 'dark'
      ? isScenarioHoveredFromRiskMatrix && !visibleType
      : true;
  const textColorAsBuiVariable = isTextColorBlack
    ? 'var(--bui-black)'
    : 'var(--bui-white)';

  return (
    <Card
      onMouseEnter={() => {
        if (visibleType || isExpanded) return;
        setHoveredScenarios(prev =>
          prev.some(s => s.ID === scenario.ID) ? prev : [...prev, scenario],
        );
      }}
      onMouseLeave={() => {
        if (visibleType || isExpanded) return;
        setHoveredScenarios(prev => prev.filter(s => s.ID !== scenario.ID));
      }}
      ref={ref}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.closest('[data-action-root]') ||
            target.closest('[data-action-collapse]') ||
            target.closest('[data-no-row-toggle]'))
        ) {
          return;
        }
        viewRow(scenario.ID);
      }}
      className={`${tableCard} ${visibleType || isExpanded ? tableCardNoHover : ''}`}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: isDragging ? 'none' : undefined,
        backgroundColor:
          isScenarioHoveredFromRiskMatrix && !visibleType
            ? highlightColor
            : undefined,
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
        <IconButton
          size="medium"
          data-action-root
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          style={{ padding: 0 }}
        >
          {isExpanded ? (
            <i className="ri-arrow-down-s-line" />
          ) : (
            <i className="ri-arrow-right-s-line" />
          )}
        </IconButton>
        <Text
          as="p"
          variant="body-large"
          weight="bold"
          style={{ width: '35%', color: textColorAsBuiVariable }}
        >
          {scenario.title}
        </Text>
        <Flex align="center" justify="start" style={{ width: '15%' }}>
          <RiskMatrixSquare
            size="small"
            probability={findProbabilityIndex(scenario.risk.probability)}
            consequence={findConsequenceIndex(scenario.risk.consequence)}
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
          <RiskMatrixSquare
            size="small"
            probability={findProbabilityIndex(
              scenario.remainingRisk.probability,
            )}
            consequence={findConsequenceIndex(
              scenario.remainingRisk.consequence,
            )}
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
      {/* If there are filtered actions (search or updated badge), show them as before.
          If the user expands the row, show all actions for the scenario regardless
          of the current filters. */}
      {filteredActions.length > 0 && !isExpanded && (
        <div data-action-root>
          <ActionRowList
            scenarioId={scenario.ID}
            displayedActions={filteredActions}
          />
        </div>
      )}

      {isExpanded && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <div data-action-root>
            <ActionRowList scenarioId={scenario.ID} />
          </div>
        </Collapse>
      )}
    </Card>
  );
}
