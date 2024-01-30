import React, { ReactNode } from 'react';
import { Box } from '@material-ui/core';
import { TableColumn } from '@backstage/core-components';
import { DeleteButton, EditButton } from './ScenarioTableButtons';
import { TableData } from '../interface/interfaces';

export const getColumns = (
  deleteRow: (id: number) => void,
  editRow: (id: number) => void,
) =>
  [
    {
      title: 'Beskrivelse',
      field: 'beskrivelse',
      type: 'string',
    },
    {
      title: 'Trusselaktør',
      field: 'trussel',
      type: 'string',
    },
    {
      title: 'Sårbarhet',
      field: 'sårbarhet',
      type: 'string',
    },
    {
      title: 'Konsekvens',
      field: 'konsekvens',
      type: 'numeric',
    },
    {
      title: 'Sannsynlighet',
      field: 'sannsynlighet',
      type: 'numeric',
    },
    {
      render: (row: TableData): ReactNode => (
        <Box style={{ display: 'flex', gap: 0.2 }}>
          <EditButton onClick={() => editRow(row.id)} />
          <DeleteButton onClick={() => deleteRow(row.id)} />
        </Box>
      ),
    },
  ] as TableColumn[];
