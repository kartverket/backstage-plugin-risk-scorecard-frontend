import { ScenarioChange } from '../../../utils/types.ts';
import { dtoToAction } from '../../../utils/DTOs.ts';
import { RiScActionChange } from './RiScActionChange.tsx';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { RiScActionChangeSet } from './RiScActionChangeSet.tsx';
import { ChangeSetChangedTitle } from './components/ChangeSetChangedTitle.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTwoColumnSplit } from './components/ChangeSetTwoColumnSplit.tsx';
import { ChangeSetColumn } from './components/ChangeSetColumn.tsx';
import { RiScRiskChangeSet } from './RiScRiskChangeSet.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { ChangeSetRemovedValue } from './components/ChangeSetRemovedValue.tsx';
import { ChangeSetAddedValue } from './components/ChangeSetAddedValue.tsx';

interface RiScScenarioChangeSetProps {
  scenario: ScenarioChange;
}

export function RiScScenarioChangeSet({
  scenario,
}: RiScScenarioChangeSetProps) {
  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        <ChangeSetTag text="Scenario" type="primary" />
      </ChangeSetTags>
      <ChangeSetChangedTitle title={scenario.title} />
      <ChangeSetTrackedProperty
        title="Description"
        property={scenario.description}
        multiline={true}
        stringOnUndefinedProperty="No description provided"
        emphasised={true}
      />
      <ChangeSetTrackedProperty title="URL" property={scenario.url} emphasised={true} />

      {(scenario.threatActors.length > 0 ||
        scenario.vulnerabilities.length > 0) && (
        <ChangeSetTwoColumnSplit>
          {scenario.threatActors.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title="Threat actors"
                value={scenario.threatActors.map(actor => {
                  if (actor.type === 'DELETED') {
                    return (
                      <div>
                        <ChangeSetRemovedValue oldValue={actor.oldValue} />
                      </div>
                    );
                  } else if (actor.type === 'ADDED') {
                    return (
                      <div>
                        <ChangeSetAddedValue newValue={actor.newValue} />
                      </div>
                    );
                  }
                  return <></>;
                })}
              />
            </ChangeSetColumn>
          )}
          {scenario.vulnerabilities.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title="Vulnerabilities"
                value={scenario.vulnerabilities.map(vulnerability => {
                  if (vulnerability.type === 'DELETED') {
                    return (
                      <div>
                        <ChangeSetRemovedValue
                          oldValue={vulnerability.oldValue}
                        />
                      </div>
                    );
                  } else if (vulnerability.type === 'ADDED') {
                    return (
                      <div>
                        <ChangeSetAddedValue
                          newValue={vulnerability.newValue}
                        />
                      </div>
                    );
                  }
                  return <></>;
                })}
              />
            </ChangeSetColumn>
          )}
        </ChangeSetTwoColumnSplit>
      )}

      <ChangeSetTwoColumnSplit>
        <ChangeSetColumn column="1">
          <RiScRiskChangeSet title="Initial risk" risk={scenario.risk} />
        </ChangeSetColumn>
        <ChangeSetColumn column="2">
          <RiScRiskChangeSet
            title="Remaining risk"
            risk={scenario.remainingRisk}
          />
        </ChangeSetColumn>
      </ChangeSetTwoColumnSplit>

      {scenario.actions.map(action => (
        <>
          {(action.type === 'ADDED' || action.type === 'DELETED') && (
            <RiScActionChange
              action={dtoToAction(
                action.type === 'ADDED' ? action.newValue : action.oldValue,
              )}
              type={action.type}
            />
          )}
          {action.type === 'CONTENT_CHANGED' && (
            <RiScActionChangeSet action={action.value} />
          )}
        </>
      ))}
    </ChangeSetBox>
  );
}
