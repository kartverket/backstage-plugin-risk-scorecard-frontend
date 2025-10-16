import { useTableStyles } from './ScenarioTableStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiSc, RiScWithMetadata } from '../../utils/types.ts';
import { useEffect, useState } from 'react';
import { useDisplayScenarios } from '../../utils/hooks.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Text, Grid } from '@backstage/ui';
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
  const { tableCellDragIcon } = useTableStyles();
  const riSc = props.riScWithMetadata.content;
  const [tempScenarios, setTempScenarios] = useState(riSc.scenarios);
  const { updateRiSc, updateStatus } = useRiScs();
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

  const displayScenarios: RiSc['scenarios'] = useDisplayScenarios(
    tempScenarios,
    visibleType,
    lastPublishedCommits,
    sortOrder ?? undefined,
  );

  const allowDrag = (sortOrder ?? '') === '';

  let columnCount = 7;
  if (props.isEditing) {
    columnCount = allowDrag ? 9 : 8;
  }

  return (
    <>
      <Grid.Root columns={`${columnCount}`} pt="40px" pb="16px">
        {props.isEditing && allowDrag && (
          <Grid.Item className={tableCellDragIcon} />
        )}
        <Grid.Item colSpan="3">
          <Text weight="bold" variant="body-large">
            {t('dictionary.title')}
          </Text>
        </Grid.Item>
        <Grid.Item colSpan="1">
          <Text weight="bold" variant="body-large">
            {t('dictionary.initialRisk')}
          </Text>
        </Grid.Item>
        <Grid.Item colSpan="2">
          <Text weight="bold" variant="body-large">
            {t('dictionary.measures')}
          </Text>
        </Grid.Item>
        <Grid.Item colSpan="1">
          <Text weight="bold" variant="body-large">
            {t('dictionary.restRisk')}
          </Text>
        </Grid.Item>
        {props.isEditing && <Grid.Item colSpan="1" />}
      </Grid.Root>
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
          allowDrag={allowDrag}
        />
      ))}
    </>
  );
}
