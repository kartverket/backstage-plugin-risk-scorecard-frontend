import { MigrationChanges51 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScMigrationChanges51Props {
  changes: MigrationChanges51;
}

export function RiScMigrationChanges51({
  changes,
}: RiScMigrationChanges51Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const numberOfChangedActions = changes.scenarios.reduce(
    (currentSum, newValue) => {
      return currentSum + newValue.changedActions.length;
    },
    0,
  );

  return (
    <>
      <MigrationTitle
        from="5.0"
        to="5.1"
        migrationExplanation={t(
          'migrationDialog.migration51.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#50"
      />
      <ChangeSetBox type="primary">
        <ChangeSetBoxTitle
          title={t('migrationDialog.migration51.addedLastUpdatedBy', {
            numberOfChangedActions: numberOfChangedActions.toString(),
          })}
        />
      </ChangeSetBox>
    </>
  );
}
