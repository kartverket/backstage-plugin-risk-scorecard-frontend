import { MigrationChanges40 } from '../../../utils/types.ts';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetChangedValue } from './components/ChangeSetChangedValue.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetText } from './components/ChangeSetText.tsx';
import { ChangeSetRemovedProperty } from './components/ChangeSetRemovedProperty.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScMigrationChanges40Props {
  changes: MigrationChanges40;
}

export function RiScMigrationChanges40({
  changes,
}: RiScMigrationChanges40Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
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
            <ChangeSetTag
              type="primary"
              text={t('migrationDialog.tagScenario')}
            />
          </ChangeSetTags>
          <ChangeSetBoxTitle title={scenario.title} />
          {scenario.changedVulnerabilities.length > 0 && (
            <ChangeSetBox type="secondary">
              <ChangeSetBoxTitle
                title={t('migrationDialog.migration40.vulnerabilitiesTitle')}
              />
              {scenario.changedVulnerabilities.map(change => (
                <ChangeSetChangedValue
                  /* @ts-ignore Because ts can't typecheck strings against our keys */
                  oldValue={t(`migrationDialog.migration40.vulnerabilities.${change.oldValue}`)}
                  /* @ts-ignore Because ts can't typecheck strings against our keys */
                  newValue={t(`migrationDialog.migration40.vulnerabilities.${change.newValue}`)}
                />
              ))}
            </ChangeSetBox>
          )}
          {scenario.removedExistingActions && (
            <ChangeSetBox type="secondary">
              <ChangeSetTags>
                <ChangeSetTag
                  type="delete"
                  text={t('migrationDialog.tagRemoved')}
                />
              </ChangeSetTags>
              <ChangeSetBoxTitle
                title={t('migrationDialog.migration40.existingActions')}
              />
              <ChangeSetText text={scenario.removedExistingActions} />
            </ChangeSetBox>
          )}
          {scenario.changedActions.map(action => (
            <ChangeSetBox type="secondary">
              <ChangeSetTags>
                <ChangeSetTag
                  type="primary"
                  text={t('migrationDialog.tagAction')}
                />
              </ChangeSetTags>
              <ChangeSetBoxTitle title={action.title} />
              {action.removedOwner && (
                <ChangeSetRemovedProperty
                  propertyName={t('migrationDialog.migration40.owner')}
                  value={action.removedOwner}
                />
              )}
              {action.removedDeadline && (
                <ChangeSetRemovedProperty
                  propertyName={t('migrationDialog.migration40.deadline')}
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
