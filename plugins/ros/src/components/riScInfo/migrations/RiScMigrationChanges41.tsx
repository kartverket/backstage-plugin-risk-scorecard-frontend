import { MigrationChanges41 } from '../../../utils/types.ts';
import { formatNOK } from '../../../utils/utilityfunctions.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetChangedValue } from './components/ChangeSetChangedValue.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScMigrationChanges41Props {
  changes: MigrationChanges41;
}

export function RiScMigrationChanges41({
  changes,
}: RiScMigrationChanges41Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <>
      <MigrationTitle
        from="4.0"
        to="4.1"
        migrationExplanation={t(
          'migrationDialog.migration41.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#41"
      />
      {changes.scenarios.map(scenario => (
        <ChangeSetBox type="primary">
          <ChangeSetTags>
            <ChangeSetTag
              type="primary"
              text={t('migrationDialog.tagScenario')}
            />
          </ChangeSetTags>
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
                  <ChangeSetBoxTitle title={t('dictionary.initialRisk')} />
                  {scenario.changedRiskConsequence && (
                    <ChangeSetChangedValue
                      propertyName={t('dictionary.consequence')}
                      oldValue={formatNOK(
                        scenario.changedRiskConsequence.oldValue,
                      )}
                      newValue={formatNOK(
                        scenario.changedRiskConsequence.newValue,
                      )}
                      denominator={t(
                        'migrationDialog.migration41.nokPerIncident',
                      )}
                    />
                  )}
                  {scenario.changedRiskProbability && (
                    <ChangeSetChangedValue
                      propertyName={t('dictionary.probability')}
                      oldValue={scenario.changedRiskProbability.oldValue.toString()}
                      newValue={scenario.changedRiskProbability.newValue.toString()}
                      denominator={t(
                        'migrationDialog.migration41.occurrencesPerYear',
                      )}
                    />
                  )}
                </ChangeSetBox>
              </div>
            )}
            {(scenario.changedRemainingRiskConsequence ||
              scenario.changedRemainingRiskProbability) && (
              <div style={{ gridColumn: 2 }}>
                <ChangeSetBox type="secondary">
                  <ChangeSetBoxTitle title={t('dictionary.restRisk')} />
                  {scenario.changedRemainingRiskConsequence && (
                    <ChangeSetChangedValue
                      propertyName={t('dictionary.consequence')}
                      oldValue={formatNOK(
                        scenario.changedRemainingRiskConsequence.oldValue,
                      )}
                      newValue={formatNOK(
                        scenario.changedRemainingRiskConsequence.newValue,
                      )}
                      denominator={t(
                        'migrationDialog.migration41.nokPerIncident',
                      )}
                    />
                  )}
                  {scenario.changedRemainingRiskProbability && (
                    <ChangeSetChangedValue
                      propertyName={t('dictionary.probability')}
                      oldValue={scenario.changedRemainingRiskProbability.oldValue.toString()}
                      newValue={scenario.changedRemainingRiskProbability.newValue.toString()}
                      denominator={t(
                        'migrationDialog.migration41.occurrencesPerYear',
                      )}
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
