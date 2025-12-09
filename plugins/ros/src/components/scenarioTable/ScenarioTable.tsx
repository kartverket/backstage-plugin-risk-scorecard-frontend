import { useTableStyles } from './ScenarioTableStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiSc, RiScWithMetadata } from '../../utils/types.ts';
import { useEffect, useMemo, useState } from 'react';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Text, Flex, Box, Card } from '@backstage/ui';
import { ScenarioTableRow } from './ScenarioTableRow.tsx';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions.ts';
import { useFilteredActionsForScenarios } from '../../utils/scenario.ts';

type ScenarioTableProps = {
  sortOrder?: string | null;
  isEditing: boolean;
  isEditingAllowed: boolean;
  riScWithMetadata: RiScWithMetadata;
  visibleType: UpdatedStatusEnumType | null;
  searchQuery: string;
};

export function ScenarioTable(props: ScenarioTableProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { tableCellDragIcon, tableCard } = useTableStyles();
  const riSc = props.riScWithMetadata.content;
  const [tempScenarios, setTempScenarios] = useState(riSc.scenarios);
  const { updateStatus } = useRiScs();

  const { openScenarioDrawer } = useScenario();

  const isAnyFilterEnabled =
    (props.sortOrder && props.sortOrder !== 'NoSorting') ||
    !!props.searchQuery ||
    !!props.visibleType;

  useEffect(() => {
    if (!updateStatus.isSuccess) {
      return;
    }
    const updatedScenarios = tempScenarios
      .map(scenario => {
        const ordered = riSc.scenarios.find(s => s.ID === scenario.ID);
        return ordered ? ordered : null;
      })
      .filter(scenario => scenario !== null) as RiSc['scenarios'];

    const scenariosNotInTemp = riSc.scenarios.filter(
      scenario => !updatedScenarios.find(s => s.ID === scenario.ID),
    );

    setTempScenarios([...updatedScenarios, ...scenariosNotInTemp]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riSc.scenarios, updateStatus.isSuccess]);

  /*
  The following functions are wrapped in useMemo to prevent recalculation
  when hovering rows in the scenario table.
   */
  const filteredActionsForScenarios = useMemo(
    () =>
      useFilteredActionsForScenarios(
        tempScenarios,
        props.visibleType,
        props.searchQuery,
      ),
    [props.visibleType, props.searchQuery, tempScenarios],
  );

  const scenariosWithAnyAction = useMemo(
    () =>
      tempScenarios.filter(scenario =>
        filteredActionsForScenarios.has(scenario.ID),
      ),
    [tempScenarios, filteredActionsForScenarios],
  );

  return (
    <>
      <Flex p="24px 24px 18px 24px">
        {props.isEditing && !isAnyFilterEnabled && (
          <div className={tableCellDragIcon} />
        )}
        <Box
          style={{
            width: props.isEditing && !isAnyFilterEnabled ? '33%' : '40%',
            paddingLeft: '5%',
          }}
        >
          <Text weight="bold" variant="body-large">
            {t('dictionary.title')}
          </Text>
        </Box>
        <Box style={{ width: '15%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.initialRisk')}
          </Text>
        </Box>
        <Box style={{ width: props.isEditing ? '25%' : '35%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.actionsWithStatus')}
          </Text>
        </Box>
        <Box style={{ width: '15%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.restRisk')}
          </Text>
        </Box>
      </Flex>
      {scenariosWithAnyAction.map((scenario, idx) => (
        <ScenarioTableRow
          key={scenario.ID}
          scenario={scenario}
          filteredActions={
            isAnyFilterEnabled
              ? filteredActionsForScenarios.get(scenario.ID)
              : undefined
          }
          isAnyFilterEnabled={isAnyFilterEnabled}
          listIndex={idx}
          viewRow={(id: string) =>
            openScenarioDrawer(id, props.isEditingAllowed)
          }
          isEditing={props.isEditing}
          setTempScenarios={setTempScenarios}
          riScWithMetadata={props.riScWithMetadata}
        />
      ))}
      {props.searchQuery && filteredActionsForScenarios.size === 0 && (
        <Card className={tableCard}>
          <Flex align="center" justify="center">
            {t('dictionary.searchQuery')} "{props.searchQuery}"
          </Flex>
        </Card>
      )}
    </>
  );
}
