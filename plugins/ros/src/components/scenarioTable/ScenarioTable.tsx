import React, { useContext } from 'react';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import { ROS } from '../utils/types';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { ScenarioTableRow } from './ScenarioTableRow';
import AddCircle from '@material-ui/icons/AddCircle';
import { ScenarioContext } from '../rosPlugin/ScenarioContext';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginTranslationRef } from '../utils/translations';

interface ScenarioTableProps {
  ros: ROS;
}

export const ScenarioTable = ({ ros }: ScenarioTableProps) => {
  const { newScenario, openScenario } = useContext(ScenarioContext)!!;

  const { t } = useTranslationRef(pluginTranslationRef);

  return (
    <>
      <Paper>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #616161',
          }}
        >
          <Typography variant="h5" style={{ padding: '1rem' }}>
            {t('scenarioTable.title')}
          </Typography>

          {ros.scenarier.length > 0 && (
            <Button
              startIcon={<AddCircle />}
              variant="text"
              color="primary"
              onClick={newScenario}
              style={{
                display: 'flex',
                padding: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              {t('scenarioTable.addScenarioButton')}
            </Button>
          )}
        </Box>
        {ros.scenarier.length === 0 ? (
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
          <TableContainer component={Paper}>
            <Table
              style={{
                backgroundColor: '#424242',
              }}
            >
              <TableHead>
                <TableRow
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid #616161',
                    alignItems: 'center',
                  }}
                >
                  <TableCell
                    style={{
                      display: 'flex',
                      width: '40%',
                      paddingTop: '0.1rem',
                      paddingBottom: '0.1rem',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.title')}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{
                      display: 'flex',
                      width: '20%',
                      paddingTop: '0.1rem',
                      paddingBottom: '0.1rem',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.initialRisk')}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{
                      display: 'flex',
                      width: '20%',
                      paddingTop: '0.1rem',
                      paddingBottom: '0.1rem',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('dictionary.restRisk')}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{
                      display: 'flex',
                      width: '20%',
                      paddingTop: '0.1rem',
                      paddingBottom: '0.1rem',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                    >
                      {t('scenarioTable.columns.measuresCount')}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ros.scenarier.map(scenario => (
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
