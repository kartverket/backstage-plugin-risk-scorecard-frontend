import { MigrationChanges50 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from '../changeset/components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from '../changeset/components/ChangeSetTags.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetChangedProperty } from '../changeset/components/ChangeSetChangedProperty.tsx';
import { getTranslatedActionStatus } from '../../../utils/utilityfunctions.ts';

interface RiScMigrationChanges50Props {
  changes: MigrationChanges50;
}

export function RiScMigrationChanges50({
  changes,
}: RiScMigrationChanges50Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <MigrationTitle
        from="4.2"
        to="5.0"
        migrationExplanation={t(
          'migrationDialog.migration50.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#50"
      />
      {changes.scenarios.map(scenario => (
        <ChangeSetBox type="primary">
          <ChangeSetTags>
            <ChangeSetTag type="primary" text={t('dictionary.scenario')} />
          </ChangeSetTags>
          <ChangeSetBoxTitle title={scenario.title} />
          {scenario.changedActions.map(action => (
            <ChangeSetBox type="secondary">
              <ChangeSetTags>
                <ChangeSetTag type="primary" text={t('dictionary.action')} />
              </ChangeSetTags>
              <ChangeSetBoxTitle title={action.title} />
              <ChangeSetChangedProperty
                propertyName={t('dictionary.status')}
                oldValue={getTranslatedActionStatus(action.oldStatus, t)}
                newValue={getTranslatedActionStatus(action.newStatus, t)}
              />
            </ChangeSetBox>
          ))}
        </ChangeSetBox>
      ))}
    </>
  );
}
