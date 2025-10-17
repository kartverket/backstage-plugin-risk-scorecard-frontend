import { useState, useEffect } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import {
  computeStatusCount,
  UpdatedStatusEnumType,
  UpdatedStatusEnum,
} from '../../utils/utilityfunctions';
import { Card, CardBody, CardHeader, Flex } from '@backstage/ui';
import { ScenarioTableCardHeader } from './ScenarioTableCardHeader.tsx';
import { OutdatedActionsCounts } from './OutdatedActionsCounts.tsx';
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
  const riSc = riScWithMetadata.content;
  const { openNewScenarioWizard } = useScenario();
  const { veryOutdatedCount, outdatedCount } =
    computeStatusCount(riScWithMetadata);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [visibleType, setVisibleType] = useState<UpdatedStatusEnumType | null>(
    null,
  );

  useEffect(() => {
    if (
      visibleType === UpdatedStatusEnum.VERY_OUTDATED &&
      veryOutdatedCount === 0
    ) {
      setVisibleType(null);
    }
    if (visibleType === UpdatedStatusEnum.OUTDATED && outdatedCount === 0) {
      setVisibleType(null);
    }
  }, [visibleType, veryOutdatedCount, outdatedCount]);

  function handleToggle(type: UpdatedStatusEnumType) {
    setVisibleType(prev => (prev === type ? null : type));
  }
  const [sortOrder, setSortOrder] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <ScenarioTableCardHeader />
      </CardHeader>
      <CardBody style={{ paddingTop: '24px' }}>
        {(veryOutdatedCount > 0 || outdatedCount > 0) && (
          <OutdatedActionsCounts
            veryOutdatedCount={veryOutdatedCount}
            outdatedCount={outdatedCount}
            onToggle={handleToggle}
            visibleType={visibleType}
          />
        )}
        {riSc.scenarios.length === 0 && editingAllowed ? (
          <Flex justify="center">
            <AddScenarioButton onNewScenario={openNewScenarioWizard} />
          </Flex>
        ) : (
          <>
            <ScenarioTableFilter
              value={sortOrder}
              onChange={setSortOrder}
              isEditing={isEditing}
              isEditingAllowed={riSc.scenarios.length > 0 && editingAllowed}
              onNewScenario={openNewScenarioWizard}
              onToggleEdit={() =>
                isEditing ? setIsEditing(false) : setIsEditing(true)
              }
            />

            <ScenarioTable
              sortOrder={sortOrder}
              isEditingAllowed={editingAllowed}
              isEditing={isEditing}
              riScWithMetadata={riScWithMetadata}
              visibleType={visibleType}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
}
