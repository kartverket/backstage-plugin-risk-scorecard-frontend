import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { ScenarioTableRow } from './ScenarioTableRow.tsx';
import { useTableStyles } from './ScenarioTableStyles.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiSc, RiScWithMetadata } from '../../utils/types.ts';
import { useEffect, useState } from 'react';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { Text } from '@backstage/ui';

type ScenarioTableV1Props = {
  isEditing: boolean;
  isEditingAllowed: boolean;
  riScWithMetadata: RiScWithMetadata;
};

export function ScenarioTable(props: ScenarioTableV1Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { rowBorder, tableCell, tableCellTitle, tableCellDragIcon } =
    useTableStyles();
  const riSc = props.riScWithMetadata.content;
  const [tempScenarios, setTempScenarios] = useState(riSc.scenarios);
  const { updateRiSc, updateStatus } = useRiScs();

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

  return (
    <TableContainer>
      <Table>
        <TableHead style={{ whiteSpace: 'nowrap' }}>
          <TableRow className={rowBorder}>
            {props.isEditing && <TableCell className={tableCellDragIcon} />}
            <TableCell className={tableCellTitle}>
              <Text weight="bold" variant="body-large">
                {t('dictionary.title')}
              </Text>
            </TableCell>
            <TableCell className={tableCell}>
              <Text weight="bold" variant="body-large">
                {t('dictionary.initialRisk')}
              </Text>
            </TableCell>

            <TableCell className={tableCell}>
              <Text weight="bold" variant="body-large">
                {t('dictionary.measures')}
              </Text>
            </TableCell>
            <TableCell className={tableCell}>
              <Text weight="bold" variant="body-large">
                {t('dictionary.restRisk')}
              </Text>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tempScenarios.map((scenario, idx) => (
            <ScenarioTableRow
              key={scenario.ID}
              index={idx}
              scenario={scenario}
              viewRow={(id: string) =>
                openScenarioDrawer(id, props.isEditingAllowed)
              }
              moveRowFinal={moveRowFinal}
              moveRowLocal={moveRowLocal}
              isLastRow={idx === riSc.scenarios.length - 1}
              isEditing={props.isEditing}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
