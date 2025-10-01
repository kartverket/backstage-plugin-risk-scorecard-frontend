import { useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { computeStatusCount } from '../../utils/utilityfunctions';
import { Card, CardBody, CardHeader, Flex } from '@backstage/ui';
import { ScenarioTableCardHeader } from './ScenarioTableCardHeader.tsx';
import { OutdatedActionsCounts } from './OutdatedActionsCounts.tsx';
import { AddScenarioButton } from './AddScenarioButton.tsx';
import { ScenarioTable } from './ScenarioTable.tsx';
import { useScenario } from '../../contexts/ScenarioContext.tsx';

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

  return (
    <Card>
      <CardHeader>
        <ScenarioTableCardHeader
          isEditing={isEditing}
          onNewScenario={openNewScenarioWizard}
          isEditingAllowed={riSc.scenarios.length > 0 && editingAllowed}
          onToggleEdit={() =>
            isEditing ? setIsEditing(false) : setIsEditing(true)
          }
        />
      </CardHeader>
      <CardBody>
        {(veryOutdatedCount > 0 || outdatedCount > 0) && (
          <OutdatedActionsCounts
            veryOutdatedCount={veryOutdatedCount}
            outdatedCount={outdatedCount}
          />
        )}
        {riSc.scenarios.length === 0 && editingAllowed ? (
          <Flex justify="center">
            <AddScenarioButton onNewScenario={openNewScenarioWizard} />
          </Flex>
        ) : (
          <>
            <ScenarioTable
              isEditingAllowed={editingAllowed}
              isEditing={isEditing}
              riScWithMetadata={riScWithMetadata}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
}
