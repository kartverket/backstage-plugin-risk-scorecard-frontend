import { MigrationChanges42 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from '../changeset/components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from '../changeset/components/ChangeSetTags.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetAddedProperty } from '../changeset/components/ChangeSetAddedProperty.tsx';
import { formatDate } from '../../../utils/utilityfunctions.ts';
import { act } from 'react';

interface RiScMigrationChanges42Props {
  changes: MigrationChanges42;
}

export function RiScMigrationChanges42({
  changes,
}: RiScMigrationChanges42Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <MigrationTitle
        from="4.1"
        to="4.2"
        migrationExplanation={t(
          'migrationDialog.migration42.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#42"
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
              <ChangeSetAddedProperty
                propertyName={t('scenarioDrawer.action.lastUpdated')}
                newValue={
                  action.lastUpdated
                    ? formatDate(action.lastUpdated)
                    : t('scenarioDrawer.action.notUpdated')
                }
              />
            </ChangeSetBox>
          ))}
        </ChangeSetBox>
      ))}
    </>
  );
}
