import { ChangeSetTitle } from '../changeset/components/ChangeSetTitle.tsx';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { RiScMigrationChanges40 } from './RiScMigrationChanges40.tsx';
import { RiScMigrationChanges41 } from './RiScMigrationChanges41.tsx';
import { MigrationStatus } from '../../../utils/types.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetChangedProperty } from '../changeset/components/ChangeSetChangedProperty.tsx';
import { RiScMigrationChanges42 } from './RiScMigrationChanges42.tsx';
import { RiScMigrationChanges50 } from './RiScMigrationChanges50.tsx';

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
        <ChangeSetChangedProperty
          propertyName={t('migrationDialog.schemaVersion')}
          oldValue={migrationStatus.migrationVersions?.fromVersion || ''}
          newValue={migrationStatus.migrationVersions?.toVersion || ''}
          compact={true}
        />
      </ChangeSetBox>
      {migrationStatus.migrationChanges40 && (
        <RiScMigrationChanges40 changes={migrationStatus.migrationChanges40} />
      )}
      {migrationStatus.migrationChanges41 && (
        <RiScMigrationChanges41 changes={migrationStatus.migrationChanges41} />
      )}
      {migrationStatus.migrationChanges42 && (
        <RiScMigrationChanges42 changes={migrationStatus.migrationChanges42} />
      )}
      {migrationStatus.migrationChanges50 && (
        <RiScMigrationChanges50 changes={migrationStatus.migrationChanges50} />
      )}
    </div>
  );
}
