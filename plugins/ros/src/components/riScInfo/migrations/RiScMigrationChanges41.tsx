import { MigrationChanges41 } from '../../../utils/types.ts';
import { formatNOK } from '../../../utils/utilityfunctions.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from '../changeset/components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from '../changeset/components/ChangeSetTags.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetTwoColumnSplit } from '../changeset/components/ChangeSetTwoColumnSplit.tsx';
import { ChangeSetColumn } from '../changeset/components/ChangeSetColumn.tsx';
import { ChangeSetChangedProperty } from '../changeset/components/ChangeSetChangedProperty.tsx';

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
              text={t('dictionary.scenario')}
            />
          </ChangeSetTags>
          <ChangeSetBoxTitle title={scenario.title} />
          <ChangeSetTwoColumnSplit>
            {(scenario.changedRiskConsequence ||
              scenario.changedRiskProbability) && (
              <ChangeSetColumn column="1">
                <ChangeSetBox type="secondary">
                  <ChangeSetBoxTitle title={t('dictionary.initialRisk')} />
                  {scenario.changedRiskConsequence && (
                    <ChangeSetChangedProperty
                      propertyName={t('dictionary.consequence')}
                      oldValue={formatNOK(
                        scenario.changedRiskConsequence.oldValue,
                      )}
                      newValue={formatNOK(
                        scenario.changedRiskConsequence.newValue,
                      )}
                      unit={t(
                        'migrationDialog.migration41.nokPerIncident',
                      )}
                      compact={true}
                    />
                  )}
                  {scenario.changedRiskProbability && (
                    <ChangeSetChangedProperty
                      propertyName={t('dictionary.probability')}
                      oldValue={scenario.changedRiskProbability.oldValue.toString()}
                      newValue={scenario.changedRiskProbability.newValue.toString()}
                      unit={t(
                        'migrationDialog.migration41.occurrencesPerYear',
                      )}
                      compact={true}
                    />
                  )}
                </ChangeSetBox>
              </ChangeSetColumn>
            )}
            {(scenario.changedRemainingRiskConsequence ||
              scenario.changedRemainingRiskProbability) && (
              <ChangeSetColumn column="2">
                <ChangeSetBox type="secondary">
                  <ChangeSetBoxTitle title={t('dictionary.restRisk')} />
                  {scenario.changedRemainingRiskConsequence && (
                    <ChangeSetChangedProperty
                      propertyName={t('dictionary.consequence')}
                      oldValue={formatNOK(
                        scenario.changedRemainingRiskConsequence.oldValue,
                      )}
                      newValue={formatNOK(
                        scenario.changedRemainingRiskConsequence.newValue,
                      )}
                      unit={t(
                        'migrationDialog.migration41.nokPerIncident',
                      )}
                      compact={true}
                    />
                  )}
                  {scenario.changedRemainingRiskProbability && (
                    <ChangeSetChangedProperty
                      propertyName={t('dictionary.probability')}
                      oldValue={scenario.changedRemainingRiskProbability.oldValue.toString()}
                      newValue={scenario.changedRemainingRiskProbability.newValue.toString()}
                      unit={t(
                        'migrationDialog.migration41.occurrencesPerYear',
                      )}
                      compact={true}
                    />
                  )}
                </ChangeSetBox>
              </ChangeSetColumn>
            )}
          </ChangeSetTwoColumnSplit>
        </ChangeSetBox>
      ))}
    </>
  );
}
