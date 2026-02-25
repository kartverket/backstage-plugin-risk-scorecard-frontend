import { useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import {
  computeStatusCount,
  UpdatedStatusEnumType,
  UpdatedStatusEnum,
} from '../../utils/utilityfunctions';
import { Card, CardBody, CardHeader, Flex } from '@backstage/ui';
import { ScenarioTableCardHeader } from './ScenarioTableCardHeader.tsx';
import { ActionCountButtons } from './ActionCountButtons.tsx';
import { AddScenarioButton } from './AddScenarioButton.tsx';
import { ScenarioTable } from './ScenarioTable.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';
import { ScenarioTableFilter } from './ScenarioTableFilter.tsx';

interface ScenarioTableProps {
  riScWithMetadata: RiScWithMetadata;
  editingAllowed: boolean;
}

export function ScenarioTableCard({
  riScWithMetadata,
  editingAllowed,
}: ScenarioTableProps) {
  const { openNewScenarioWizard } = useScenario();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { veryOutdatedCount, outdatedCount, updatedCount } =
    computeStatusCount(riScWithMetadata);
  const [selectedUpdatedStatus, setSelectedUpdatedStatus] =
    useState<UpdatedStatusEnumType | null>(null);

  // Remove updated status selection if there is none to display
  const updatedStatusToDisplay =
    (selectedUpdatedStatus === UpdatedStatusEnum.VERY_OUTDATED &&
      veryOutdatedCount === 0) ||
    (selectedUpdatedStatus === UpdatedStatusEnum.OUTDATED &&
      outdatedCount === 0)
      ? null
      : selectedUpdatedStatus;

  function handleActionCountClick(type: UpdatedStatusEnumType) {
    setSelectedUpdatedStatus(prev => (prev === type ? null : type));
  }
  const [scenarioSortOrder, setScenarioSortOrder] = useState<string | null>(
    null,
  );

  const [actionSearchQuery, setActionSearchQuery] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <ScenarioTableCardHeader />
      </CardHeader>
      <CardBody style={{ paddingTop: '12px' }}>
        {(veryOutdatedCount > 0 || outdatedCount > 0) && (
          <ActionCountButtons
            veryOutdatedCount={veryOutdatedCount}
            outdatedCount={outdatedCount}
            updatedCount={updatedCount}
            onActionCountClick={handleActionCountClick}
            updatedStatusToDisplay={updatedStatusToDisplay}
          />
        )}
        {riScWithMetadata.content.scenarios.length === 0 && editingAllowed ? (
          <Flex justify="center">
            <AddScenarioButton onNewScenario={openNewScenarioWizard} />
          </Flex>
        ) : (
          <>
            <ScenarioTableFilter
              scenarioSortOrder={scenarioSortOrder}
              onScenarioSortOrderChange={setScenarioSortOrder}
              isEditingScenarioTable={isEditing}
              actionSearchQuery={actionSearchQuery}
              onActionSearchQueryChange={setActionSearchQuery}
              isEditingScenarioTableAllowed={
                riScWithMetadata.content.scenarios.length > 0 && editingAllowed
              }
              onToggleEditScenarioTable={() =>
                isEditing ? setIsEditing(false) : setIsEditing(true)
              }
              onNewScenario={openNewScenarioWizard}
            />

            <ScenarioTable
              riScWithMetadata={riScWithMetadata}
              isEditingAllowed={editingAllowed}
              isEditing={isEditing}
              visibleType={updatedStatusToDisplay}
              actionSearchQuery={actionSearchQuery}
              scenarioSortOrder={scenarioSortOrder}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
}
