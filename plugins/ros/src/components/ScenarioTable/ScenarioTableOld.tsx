import { mapToTableData } from '../utils/utilityfunctions';
import React from 'react';
import { Table as BSTable } from '@backstage/core-components';
import { ROS } from '../interface/interfaces';
import { getColumns } from './ScenarioTableColumns';

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
  return (
    <BSTable
      options={{ paging: false }}
      data={mapToTableData(ros)}
      columns={getColumns(deleteRow, editRow)}
      title="Scenarioer"
    />
  );
};
