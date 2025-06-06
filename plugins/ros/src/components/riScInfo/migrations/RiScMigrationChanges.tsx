import { ChangeSetTitle } from './components/ChangeSetTitle.tsx';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetChangedValue } from './components/ChangeSetChangedValue.tsx';
import { RiScMigrationChanges40 } from './RiScMigrationChanges40.tsx';
import { RiScMigrationChanges41 } from './RiScMigrationChanges41.tsx';
import { MigrationStatus } from '../../../utils/types.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScMigrationChangesProps {
  migrationStatus: MigrationStatus;
}

export function RiScMigrationChanges({
  migrationStatus,
}: RiScMigrationChangesProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <div>
      <ChangeSetTitle text={t('migrationDialog.schemaVersion')} />
      <ChangeSetBox type="primary">
        <ChangeSetChangedValue
          propertyName={t('migrationDialog.schemaVersion')}
          oldValue={migrationStatus.migrationVersions?.fromVersion || ''}
          newValue={migrationStatus.migrationVersions?.toVersion || ''}
        />
      </ChangeSetBox>
      {migrationStatus.migrationChanges40 && (
        <RiScMigrationChanges40 changes={migrationStatus.migrationChanges40} />
      )}
      {migrationStatus.migrationChanges41 && (
        <RiScMigrationChanges41 changes={migrationStatus.migrationChanges41} />
      )}
    </div>
  );
}
