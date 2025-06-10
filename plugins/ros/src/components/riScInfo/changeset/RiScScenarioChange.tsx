import { Scenario } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { RiScActionChange } from './RiScActionChange.tsx';
import { ChangeSetTwoColumnSplit } from './components/ChangeSetTwoColumnSplit.tsx';
import { ChangeSetColumn } from './components/ChangeSetColumn.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { RiScRiskChange } from './RiScRiskChange.tsx';

interface RiScWholeScenarioChangeProps {
  scenario: Scenario;
  type: 'ADDED' | 'DELETED';
}

export function RiScScenarioChange({
  scenario,
  type,
}: RiScWholeScenarioChangeProps) {
  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        {type === 'ADDED' ? (
          <ChangeSetTag text="Added" type="added" />
        ) : (
          <ChangeSetTag text="Deleted" type="delete" />
        )}
        <ChangeSetTag text="Scenario" type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={scenario.title} />
      <ChangeSetProperty
        title="Description"
        value={
          scenario.description ? (
            scenario.description
          ) : (
            <i>No description provided</i>
          )
        }
        emphasised={true}
      />
      {scenario.url && (
        <ChangeSetProperty title="URL" value={scenario.url} emphasised={true} />
      )}
      {(scenario.threatActors.length > 0 ||
        scenario.vulnerabilities.length > 0) && (
        <ChangeSetTwoColumnSplit>
          {scenario.threatActors.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title="Threat actors"
                value={
                  <>
                    {scenario.threatActors.map(actor => (
                      <div>{actor}</div>
                    ))}
                  </>
                }
                emphasised={true}
              />
            </ChangeSetColumn>
          )}
          {scenario.vulnerabilities.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title="Vulnerabilities"
                value={
                  <>
                    {scenario.vulnerabilities.map(vulnerability => (
                      <div>{vulnerability}</div>
                    ))}
                  </>
                }
                emphasised={true}
              />
            </ChangeSetColumn>
          )}
        </ChangeSetTwoColumnSplit>
      )}

      <ChangeSetTwoColumnSplit>
        <ChangeSetColumn column="1">
          <RiScRiskChange title="Initial risk" risk={scenario.risk} />
        </ChangeSetColumn>
        <ChangeSetColumn column="2">
          <RiScRiskChange
            title="Remaining risk"
            risk={scenario.remainingRisk}
          />
        </ChangeSetColumn>
      </ChangeSetTwoColumnSplit>

      {scenario.actions &&
        scenario.actions.map(action => (
          <RiScActionChange action={action} type={type} />
        ))}
    </ChangeSetBox>
  );
}
