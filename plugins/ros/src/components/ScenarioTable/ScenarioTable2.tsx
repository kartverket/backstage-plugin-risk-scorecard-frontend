import React from 'react';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { ROS, Scenario } from '../interface/interfaces';
import { DeleteButton, EditButton } from './ScenarioTableButtons';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

interface ScenarioTableProps {
  ros: ROS;
  deleteRow: (id: number) => void;
  editRow: (id: number) => void;
}

export const ScenarioTable = ({
  ros,
  deleteRow,
  editRow,
}: ScenarioTableProps) => {
  const Row = ({ scenario }: { scenario: Scenario }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <>
        <TableRow key={scenario.ID}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{scenario.beskrivelse}</TableCell>
          <TableCell align="center">{scenario.risiko.konsekvens}</TableCell>
          <TableCell align="center">{scenario.risiko.sannsynlighet}</TableCell>
          <TableCell>
            <EditButton onClick={() => editRow(scenario.ID)} />
            <DeleteButton onClick={() => deleteRow(scenario.ID)} />
          </TableCell>
        </TableRow>
        {/*
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <div style={{ display: open ? 'block' : 'none' }}>
                        <TableCell>
                          {scenario.trusselaktører.join(', ')}
                        </TableCell>
                        <TableCell>{scenario.sårbarheter.join(', ')}</TableCell>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TableCell>
        </TableRow>
        */}
      </>
    );
  };

  return (
    <TableContainer component={Paper} style={{ border: '1px solid #e0e0e0' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map(column => (
              <TableCell>{column}</TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {ros.scenarier.map(scenario => (
            <Row scenario={scenario} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const columns = [
  'Beskrivelse',
  // 'Trusselaktør',
  // 'Sårbarhet',
  'Konsekvens',
  'Sannsynlighet',
];
