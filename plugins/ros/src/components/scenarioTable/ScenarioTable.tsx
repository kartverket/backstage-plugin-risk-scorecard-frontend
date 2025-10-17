import { useTableStyles } from './ScenarioTableStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiSc, RiScWithMetadata } from '../../utils/types.ts';
import { useEffect, useMemo, useState } from 'react';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
} from '../../utils/utilityfunctions.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Text, Flex, Box } from '@backstage/ui';
import { ScenarioTableRow } from './ScenarioTableRow.tsx';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions.ts';

type ScenarioTableProps = {
  isEditing: boolean;
  isEditingAllowed: boolean;
  riScWithMetadata: RiScWithMetadata;
  visibleType: UpdatedStatusEnumType | null;
};

export function ScenarioTable(props: ScenarioTableProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { tableCellDragIcon } = useTableStyles();
  const riSc = props.riScWithMetadata.content;
  const [tempScenarios, setTempScenarios] = useState(riSc.scenarios);
  const { updateRiSc, updateStatus } = useRiScs();
  const visibleType = props.visibleType;

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

  function moveRowLocal(dragIndex: number, hoverIndex: number) {
    const updatedScenarios = [...tempScenarios];
    const [removed] = updatedScenarios.splice(dragIndex, 1);
    updatedScenarios.splice(hoverIndex, 0, removed);
    setTempScenarios(updatedScenarios);
  }

  function moveRowFinal(dragIndex: number, dropIndex: number) {
    const updatedScenarios = [...tempScenarios];
    const [removed] = updatedScenarios.splice(dragIndex, 1);
    updatedScenarios.splice(dropIndex, 0, removed);
    setTempScenarios(updatedScenarios);

    const updatedRiSc = {
      ...props.riScWithMetadata,
      content: {
        ...riSc,
        scenarios: updatedScenarios,
      },
    };
    updateRiSc(updatedRiSc, () => {});
  }

  const lastPublishedCommits =
    props.riScWithMetadata.lastPublished?.numberOfCommits ?? null;

  const displayScenarios = useMemo(() => {
    if (!visibleType) return tempScenarios;

    return tempScenarios.filter(scenario =>
      scenario.actions.some(action => {
        const daysSinceLastUpdate = action.lastUpdated
          ? calculateDaysSince(new Date(action.lastUpdated))
          : null;
        const status = calculateUpdatedStatus(
          daysSinceLastUpdate,
          lastPublishedCommits,
        );
        return status === visibleType;
      }),
    );
  }, [tempScenarios, visibleType, lastPublishedCommits]);

  return (
    <>
      <Flex p=" 18px 24px" mt="40px">
        {props.isEditing && <div className={tableCellDragIcon} />}
        <Box style={{ width: props.isEditing ? '30%' : '35%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.title')}
          </Text>
        </Box>
        <Box style={{ width: '15%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.measures')}
          </Text>
        </Box>
        <Box style={{ width: props.isEditing ? '25%' : '35%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.initialRisk')}
          </Text>
        </Box>
        <Box style={{ width: '15%' }}>
          <Text weight="bold" variant="body-large">
            {t('dictionary.restRisk')}
          </Text>
        </Box>
      </Flex>
      {displayScenarios.map((scenario, idx) => (
        <ScenarioTableRow
          key={scenario.ID}
          scenario={scenario}
          index={idx}
          visibleType={visibleType}
          viewRow={(id: string) =>
            openScenarioDrawer(id, props.isEditingAllowed)
          }
          moveRowFinal={moveRowFinal}
          moveRowLocal={moveRowLocal}
          isEditing={props.isEditing}
        />
      ))}
    </>
  );
}
