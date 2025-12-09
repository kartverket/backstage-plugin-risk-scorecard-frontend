import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Collapse, IconButton } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  useState,
  useRef,
  useEffect,
  MouseEvent,
  SetStateAction,
  Dispatch,
} from 'react';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScWithMetadata, Scenario } from '../../utils/types';
import { useRiScs } from '../../contexts/RiScContext';
import {
  deleteScenario,
  findConsequenceIndex,
  findProbabilityIndex,
  getConsequenceLevel,
  getProbabilityLevel,
} from '../../utils/utilityfunctions';
import { ScenarioTableProgressBar } from './ScenarioTableProgressBar';
import { useTableStyles } from './ScenarioTableStyles';
import { Text, Flex, Card } from '@backstage/ui';
import { DeleteScenarioConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { ActionStatusOptions } from '../../utils/constants';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { useTheme } from '@mui/material/styles';
import { ActionRowList } from '../action/ActionRowList.tsx';
import { RiskMatrixSquare } from '../riskMatrix/RiskMatrixSquare.tsx';
import {
  useScenarioTableDrag,
  useScenarioTableDrop,
} from '../../hooks/UseScenarioTableDnD.ts';

interface ScenarioTableRowProps {
  scenario: Scenario;
  filteredActionIds?: string[];
  isAnyFilterEnabled: boolean;
  isDnDAllowed?: boolean;
  viewRow: (id: string) => void;
  listIndex: number;
  isEditing: boolean;
  setTempScenarios: Dispatch<SetStateAction<Scenario[]>>;
  riScWithMetadata: RiScWithMetadata;
}

export function ScenarioTableRow({
  scenario,
  filteredActionIds,
  isAnyFilterEnabled,
  isDnDAllowed,
  viewRow,
  listIndex,
  isEditing,
  setTempScenarios,
  riScWithMetadata,
}: ScenarioTableRowProps) {
  // Getting global state
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { hoveredScenarios, setHoveredScenarios } = useScenario();

  // Initializing local state
  const [isScenarioDeletionDialogOpen, setScenarioDeletionDialogOpen] =
    useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Drag n Drop functionality definitions
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useScenarioTableDrop(
    listIndex,
    scenario.ID,
    setTempScenarios,
    ref,
  );

  useEffect(() => {
    setIsExpanded(!!filteredActionIds);
  }, [filteredActionIds]);

  const [{ isDragging }, drag, preview] = useScenarioTableDrag(
    listIndex,
    scenario.ID,
    setTempScenarios,
    riScWithMetadata,
  );

  preview(drop(ref));

  // Styling
  useEffect(() => {
    if (isExpanded) {
      setHoveredScenarios(prev => prev.filter(s => s.ID !== scenario.ID));
    }
    // only run when visibleType or expansion changes for this scenario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const theme = useTheme();
  const { tableCard, tableCardNoHover } = useTableStyles();
  const isScenarioHoveredFromRiskMatrix = hoveredScenarios.some(
    s => s.ID === scenario.ID,
  );

  const highlightColor =
    theme.palette.mode === 'dark'
      ? 'var(--ros-gray-300)'
      : 'var(--ros-gray-100)';
  const isTextColorBlack =
    theme.palette.mode === 'dark' ? isScenarioHoveredFromRiskMatrix : true;
  const textColorAsBuiVariable = isTextColorBlack
    ? 'var(--bui-black)'
    : 'var(--bui-white)';

  return (
    <Card
      onMouseEnter={() => {
        if (isExpanded) return;
        setHoveredScenarios(prev =>
          prev.some(s => s.ID === scenario.ID) ? prev : [...prev, scenario],
        );
      }}
      onMouseLeave={() => {
        if (isExpanded) return;
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
      className={`${tableCard} ${isExpanded ? tableCardNoHover : ''}`}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: isDragging ? 'none' : undefined,
        backgroundColor: isScenarioHoveredFromRiskMatrix
          ? highlightColor
          : undefined,
      }}
    >
      <Flex align="center">
        {isEditing && isDnDAllowed && (
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
      {isExpanded && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <div data-action-root>
            <ActionRowList
              scenarioId={scenario.ID}
              displayedActions={scenario.actions.filter(action =>
                isAnyFilterEnabled && filteredActionIds
                  ? filteredActionIds.includes(action.ID)
                  : true,
              )}
            />
          </div>
        </Collapse>
      )}
    </Card>
  );
}
