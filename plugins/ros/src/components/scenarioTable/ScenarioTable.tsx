import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import AddCircle from '@material-ui/icons/AddCircle';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { CheckCircle, Edit } from '@mui/icons-material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRiScs } from '../../contexts/RiScContext';
import { useScenario } from '../../contexts/ScenarioContext';
import { useFontStyles } from '../../utils/style';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiSc, RiScStatus, RiScWithMetadata } from '../../utils/types';
import { ScenarioTableRow } from './ScenarioTableRow';
import { useTableStyles } from './ScenarioTableStyles';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnum,
} from '../../utils/utilityfunctions';

interface ScenarioTableProps {
  riScWithMetadata: RiScWithMetadata;
  editingAllowed: boolean;
}

export function ScenarioTable({
  riScWithMetadata,
  editingAllowed,
}: ScenarioTableProps) {
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

  function handleFilterButtonClick(status: String) {
    console.log(tempScenarios);
    const { updateStatus } = useRiScs();
    console.log('Status', updateStatus);

    const scenariosWithCalculatedStatus = tempScenarios.map(scenario => ({
      ...scenario,
      actions: scenario.actions.map(action => {
        const days = calculateDaysSince(
          action.lastUpdated ? new Date(action.lastUpdated) : new Date(0),
        );
        const commits = null;
        const calcStatus = calculateUpdatedStatus(days, commits);

        return {
          ...action,
          calculatedStatus: calcStatus,
        };
      }),
    }));
    let filteredActions;
    filteredActions = scenariosWithCalculatedStatus.flatMap(scenario =>
      scenario.actions.filter(action => action.calculatedStatus === status),
    );
    console.log(filteredActions);
  }
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <>
      <Paper>
        <Box className={titleBox}>
          <Typography variant="h5" style={{ padding: '1rem', marginBottom: 0 }}>
            {t('scenarioTable.title')}
          </Typography>

          {riSc.scenarios.length > 0 && editingAllowed && (
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
        <Box style={{ margin: '1rem' }}>
          <Button
            onClick={() =>
              handleFilterButtonClick(UpdatedStatusEnum.VERY_OUTDATED)
            }
            style={{
              marginRight: '0.5rem',
              border: '1px solid red',
              borderRadius: '20px',
            }}
          >
            {t('filterButton.veryOutdated')}
          </Button>
          <Button
            onClick={() =>
              handleFilterButtonClick(UpdatedStatusEnum.LITTLE_OUTDATED)
            }
            style={{
              marginRight: '0.5rem',
              border: '1px solid orange',
              borderRadius: '20px',
            }}
          >
            {t('filterButton.littleOutdated')}
          </Button>
          <Button
            onClick={() => handleFilterButtonClick('Both')}
            style={{
              marginRight: '0.5rem',
              border: '1px solid green',
              borderRadius: '20px',
            }}
          >
            {t('filterButton.seeActions')}
          </Button>
        </Box>
        {riSc.scenarios.length === 0 && editingAllowed ? (
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
                        style={{ paddingBottom: 0, textAlign: 'center' }}
                      >
                        {t('dictionary.initialRisk')}
                      </Typography>
                    </TableCell>

                    <TableCell className={tableCell}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0, textAlign: 'center' }}
                      >
                        {t('dictionary.measures')}
                      </Typography>
                    </TableCell>
                    <TableCell className={tableCell}>
                      <Typography
                        className={label}
                        style={{ paddingBottom: 0, textAlign: 'center' }}
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
                      viewRow={(id: string) =>
                        openScenarioDrawer(id, editingAllowed)
                      }
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
        editingAllowed={
          riScWithMetadata.status !== RiScStatus.DeletionDraft &&
          riScWithMetadata.status !== RiScStatus.DeletionSentForApproval
        }
        key={riScWithMetadata.id}
        riScWithMetadata={riScWithMetadata}
      />
    </DndProvider>
  );
}
