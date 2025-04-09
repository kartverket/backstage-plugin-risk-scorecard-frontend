import { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { ScenarioTableRow } from './ScenarioTableRow';
import AddCircle from '@material-ui/icons/AddCircle';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useTableStyles } from './ScenarioTableStyles';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useScenario } from '../../contexts/ScenarioContext';
import { RiSc, RiScWithMetadata } from '../../utils/types';
import { useFontStyles } from '../../utils/style';
import { useRiScs } from '../../contexts/RiScContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CheckCircle, Edit } from '@mui/icons-material';

interface ScenarioTableProps {
  riScWithMetadata: RiScWithMetadata;
}

export function ScenarioTable({ riScWithMetadata }: ScenarioTableProps) {
  const riSc = riScWithMetadata.content;
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label } = useFontStyles();
  const { titleBox, rowBorder, tableCell, tableCellTitle, tableCellDragIcon } =
    useTableStyles();
  const { openNewScenarioWizard, openScenarioDrawer } = useScenario();
  const [tempScenarios, setTempScenarios] = useState(riSc.scenarios);
  const { updateRiSc, updateStatus } = useRiScs();

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
      ...riScWithMetadata,
      content: {
        ...riSc,
        scenarios: updatedScenarios,
      },
    };
    updateRiSc(updatedRiSc, () => {});
  }

  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <>
      <Paper>
        <Box className={titleBox}>
          <Typography variant="h5" style={{ padding: '1rem', marginBottom: 0 }}>
            {t('scenarioTable.title')}
          </Typography>

          {riSc.scenarios.length > 0 && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingRight: '1rem',
              }}
            >
              <Button
                startIcon={<AddCircle />}
                variant="text"
                color="primary"
                onClick={openNewScenarioWizard}
              >
                {t('scenarioTable.addScenarioButton')}
              </Button>
              <Button
                startIcon={isEditing ? <CheckCircle /> : <Edit />}
                variant="text"
                color="primary"
                onClick={() =>
                  isEditing ? setIsEditing(false) : setIsEditing(true)
                }
              >
                {isEditing
                  ? t('scenarioTable.doneEditing')
                  : t('scenarioTable.editButton')}
              </Button>
            </Box>
          )}
        </Box>
        {riSc.scenarios.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <Button
              startIcon={<AddCircleOutlineIcon />}
              variant="contained"
              color="primary"
              onClick={openNewScenarioWizard}
              style={{
                display: 'flex',
                padding: '0.5rem 1rem 0.5rem 1rem',
                justifyContent: 'center',
              }}
            >
              {t('scenarioTable.addScenarioButton')}
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer style={{ overflow: 'auto' }} component={Paper}>
              <Table>
                <TableHead style={{ whiteSpace: 'nowrap' }}>
                  <TableRow className={rowBorder}>
                    {isEditing && <TableCell className={tableCellDragIcon} />}
                    <TableCell className={tableCellTitle}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0 }}
                      >
                        {t('dictionary.title')}
                      </Typography>
                    </TableCell>
                    <TableCell className={tableCell}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0 }}
                      >
                        {t('dictionary.initialRisk')}
                      </Typography>
                    </TableCell>

                    <TableCell className={tableCell}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0 }}
                      >
                        {t('dictionary.measures')}
                      </Typography>
                    </TableCell>
                    <TableCell className={tableCell}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0 }}
                      >
                        {t('dictionary.restRisk')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tempScenarios.map((scenario, idx) => (
                    <ScenarioTableRow
                      key={scenario.ID}
                      index={idx}
                      scenario={scenario}
                      viewRow={openScenarioDrawer}
                      moveRowFinal={moveRowFinal}
                      moveRowLocal={moveRowLocal}
                      isLastRow={idx === riSc.scenarios.length - 1}
                      isEditing={isEditing}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </>
  );
}

interface ScenarioTableWrapperProps {
  riScWithMetadata: RiScWithMetadata;
}

export function ScenarioTableWrapper({
  riScWithMetadata,
}: ScenarioTableWrapperProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScenarioTable
        key={riScWithMetadata.id}
        riScWithMetadata={riScWithMetadata}
      />
    </DndProvider>
  );
}
