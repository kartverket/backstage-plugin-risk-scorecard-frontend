import React, { useContext } from 'react';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import { RiSc } from '../utils/types';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { ScenarioTableRow } from './ScenarioTableRow';
import AddCircle from '@material-ui/icons/AddCircle';
import { ScenarioContext } from '../riScPlugin/ScenarioContext';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useTableStyles } from './ScenarioTableStyles';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

interface ScenarioTableProps {
  riSc: RiSc;
}

export const ScenarioTable = ({ riSc }: ScenarioTableProps) => {
  const { newScenario, openScenario } = useContext(ScenarioContext)!!;
  const { titleBox, rowBorder, tableCell } = useTableStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Paper>
        <Box className={titleBox}>
          <Typography variant="h5" style={{ padding: '1rem' }}>
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
                onClick={newScenario}
              >
                {t('scenarioTable.addScenarioButton')}
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
              onClick={newScenario}
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
          <TableContainer style={{ overflow: 'auto' }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow className={rowBorder}>
                  <TableCell
                    className={tableCell}
                    style={{
                      width: '40%',
                      minWidth: '200px',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.title')}
                    </Typography>
                  </TableCell>
                  <TableCell className={tableCell}>
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.initialRisk')}
                    </Typography>
                  </TableCell>

                  <TableCell className={tableCell}>
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('scenarioTable.columns.measuresCount')}
                    </Typography>
                  </TableCell>
                  <TableCell className={tableCell}>
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.restRisk')}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {riSc.scenarios.map(scenario => (
                  <ScenarioTableRow
                    key={scenario.ID}
                    scenario={scenario}
                    viewRow={openScenario}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};
