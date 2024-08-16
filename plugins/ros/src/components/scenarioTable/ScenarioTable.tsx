import React, { useState } from 'react';
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
import update from 'immutability-helper';
import { RiSc } from '../../utils/types';
import { useFontStyles } from '../../utils/style';

export interface ScenarioTableProps {
  riSc: RiSc;
}

export const ScenarioTable = ({ riSc }: ScenarioTableProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label } = useFontStyles();
  const { titleBox, rowBorder, tableCell, tableCellTitle } = useTableStyles();
  const { openNewScenarioWizard, openScenarioDrawer } = useScenario();
  const [scenarios, setScenarios] = useState(riSc.scenarios);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const draggedRow = scenarios[dragIndex];
    setScenarios(
      update(scenarios, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedRow],
        ],
      }),
    );
  };

  const saveOrder = () => {
    // Implement your save logic here
    console.log('New order saved', scenarios);
  };

  return (
    <>
      <Paper>
        <Box className={titleBox}>
          <Typography variant="h5" style={{ padding: '1rem', marginBottom: 0 }}>
            {t('scenarioTable.title')}
          </Typography>

          {scenarios.length > 0 && (
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
            </Box>
          )}
        </Box>
        {scenarios.length === 0 ? (
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
                  {scenarios.map((scenario, idx) => (
                    <ScenarioTableRow
                      key={scenario.ID}
                      index={idx}
                      scenario={scenario}
                      viewRow={openScenarioDrawer}
                      moveRow={moveRow}
                      isLastRow={idx === scenarios.length - 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={saveOrder}
              style={{ margin: '1rem' }}
            >
              Save Order
            </Button>
          </>
        )}
      </Paper>
    </>
  );
};
