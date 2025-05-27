import { MigrationChanges40 } from '../../../utils/types.ts';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetChangedValue } from './components/ChangeSetChangedValue.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetText } from './components/ChangeSetText.tsx';
import { ChangeSetRemovedProperty } from './components/ChangeSetRemovedProperty.tsx';

interface RiScMigrationChanges40Props {
  changes: MigrationChanges40;
}

export function RiScMigrationChanges40({
  changes,
}: RiScMigrationChanges40Props) {
  return (
    <>
      <MigrationTitle
        from="3.3"
        to="4.0"
        migrationExplanation="This migration removes the owner and deadline fields from actions, removes existing actions and updates values for vulnerabilities."
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#40"
      />
      {changes.scenarios.map(scenario => (
        <ChangeSetBox type="primary">
          <ChangeSetTags>
            <ChangeSetTag type="primary" text="Risk scenario" />
          </ChangeSetTags>
          <ChangeSetBoxTitle title={scenario.title} />
          {scenario.changedVulnerabilities.length > 0 && (
            <ChangeSetBox type="secondary">
              <ChangeSetBoxTitle title="Vulnerabilities" />
              {scenario.changedVulnerabilities.map(change => (
                <ChangeSetChangedValue
                  oldValue={change.oldValue}
                  newValue={change.newValue}
                />
              ))}
            </ChangeSetBox>
          )}
          {scenario.removedExistingActions && (
            <ChangeSetBox type="secondary">
              <ChangeSetTags>
                <ChangeSetTag type="delete" text="Removed" />
              </ChangeSetTags>
              <ChangeSetBoxTitle title="Existing actions"/>
              <ChangeSetText text={scenario.removedExistingActions} />
            </ChangeSetBox>
          )}
          {scenario.changedActions.map(action => (
            <ChangeSetBox type="secondary">
              <ChangeSetTags>
                <ChangeSetTag text="Action" type="primary" />
              </ChangeSetTags>
              <ChangeSetBoxTitle title={action.title} />
              {action.removedOwner && (
                <ChangeSetRemovedProperty
                  propertyName="Owner"
                  value={action.removedOwner}
                />
              )}
              {action.removedDeadline && (
                <ChangeSetRemovedProperty
                  propertyName="Deadline"
                  value={action.removedDeadline}
                />
              )}
            </ChangeSetBox>
          ))}
        </ChangeSetBox>
      ))}
    </>
  );
}
