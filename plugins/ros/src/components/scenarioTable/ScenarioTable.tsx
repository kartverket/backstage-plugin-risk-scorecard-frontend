import { useTableStyles } from './ScenarioTableStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiSc, RiScWithMetadata } from '../../utils/types.ts';
import { useEffect, useState } from 'react';
import { useDisplayScenarios, useSearchActions } from '../../utils/hooks.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Text, Flex, Box, Card } from '@backstage/ui';
import { ScenarioTableRow } from './ScenarioTableRow.tsx';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions.ts';

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
  const visibleType = props.visibleType;
  const sortOrder = props.sortOrder;

  const { openScenarioDrawer } = useScenario();

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

  const lastPublishedCommits =
    props.riScWithMetadata.lastPublished?.numberOfCommits ?? null;

  const displayScenarios: RiSc['scenarios'] = useDisplayScenarios(
    tempScenarios,
    visibleType,
    lastPublishedCommits,
    sortOrder ?? undefined,
  );

  const { matches: searchedActions } = useSearchActions(
    riSc.scenarios,
    props.searchQuery,
  );
  const scenariosToRender =
    (props.searchQuery ?? '')
      ? displayScenarios.filter(search => Boolean(searchedActions[search.ID]))
      : displayScenarios;

  const isDnDAllowed = (sortOrder ?? '') === '';

  return (
    <>
      <Flex p="24px 24px 18px 24px">
        {props.isEditing && isDnDAllowed && (
          <div className={tableCellDragIcon} />
        )}
        <Box
          style={{
            width: props.isEditing && isDnDAllowed ? '33%' : '40%',
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
      {scenariosToRender.map((scenario, idx) => (
        <ScenarioTableRow
          key={scenario.ID}
          scenario={scenario}
          listIndex={idx}
          visibleType={visibleType}
          viewRow={(id: string) =>
            openScenarioDrawer(id, props.isEditingAllowed)
          }
          isEditing={props.isEditing}
          isDnDAllowed={isDnDAllowed}
          searchMatches={searchedActions[scenario.ID]}
          setTempScenarios={setTempScenarios}
          riScWithMetadata={props.riScWithMetadata}
        />
      ))}
      {props.searchQuery && scenariosToRender.length === 0 && (
        <Card className={tableCard}>
          <Flex align="center" justify="center">
            {t('dictionary.searchQuery')} "{props.searchQuery}"
          </Flex>
        </Card>
      )}
    </>
  );
}
