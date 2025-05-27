import { MigrationChanges41 } from '../../../utils/types.ts';
import { formatNOK } from '../../../utils/utilityfunctions.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetChangedValue } from './components/ChangeSetChangedValue.tsx';

export function RiScMigrationChanges41({
  changes,
}: {
  changes: MigrationChanges41;
}) {
  return (
    <>
      <MigrationTitle
        from="4.0"
        to="4.1"
        migrationExplanation="This migration changes preset values for consequence and probability."
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#41"
      />
      {changes.scenarios.map(scenario => (
        <ChangeSetBox type="primary">
          <ChangeSetTag text="Risk scenario" />
          <ChangeSetBoxTitle title={scenario.title} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
            }}
          >
            {(scenario.changedRiskConsequence ||
              scenario.changedRiskProbability) && (
              <div style={{ gridColumn: 1 }}>
                <ChangeSetBox type="secondary">
                  <ChangeSetBoxTitle title="Initial risk" />
                  {scenario.changedRiskConsequence && (
                    <ChangeSetChangedValue
                      property="Consequence"
                      oldValue={formatNOK(
                        scenario.changedRiskConsequence.oldValue,
                      )}
                      newValue={formatNOK(
                        scenario.changedRiskConsequence.newValue,
                      )}
                      denominator="NOK/incident"
                    />
                  )}
                  {scenario.changedRiskProbability && (
                    <ChangeSetChangedValue
                      property="Probability"
                      oldValue={scenario.changedRiskProbability.oldValue.toString()}
                      newValue={scenario.changedRiskProbability.newValue.toString()}
                      denominator="occurrences/year"
                    />
                  )}
                </ChangeSetBox>
              </div>
            )}
            {(scenario.changedRemainingRiskConsequence ||
              scenario.changedRemainingRiskProbability) && (
              <div style={{ gridColumn: 2 }}>
                <ChangeSetBox type="secondary">
                  <ChangeSetBoxTitle title="Remaining risk" />
                  {scenario.changedRemainingRiskConsequence && (
                      <ChangeSetChangedValue
                          property="Consequence"
                          oldValue={formatNOK(
                              scenario.changedRemainingRiskConsequence.oldValue,
                          )}
                          newValue={formatNOK(
                              scenario.changedRemainingRiskConsequence.newValue,
                          )}
                          denominator="NOK/incident"
                      />
                  )}
                  {scenario.changedRemainingRiskProbability && (
                      <ChangeSetChangedValue
                          property="Probability"
                          oldValue={scenario.changedRemainingRiskProbability.oldValue.toString()}
                          newValue={scenario.changedRemainingRiskProbability.newValue.toString()}
                          denominator="occurrences/year"
                      />
                  )}
                </ChangeSetBox>
              </div>
            )}
          </div>
        </ChangeSetBox>
      ))}
    </>
  );
}
