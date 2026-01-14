import { MigrationChanges53 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetAddedProperty } from '../changeset/components/ChangeSetAddedProperty.tsx';
import { ChangeSetText } from '../changeset/components/ChangeSetText.tsx';

interface RiScMigrationChanges53Props {
  changes: MigrationChanges53;
}

export function RiScMigrationChanges53(props: RiScMigrationChanges53Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <MigrationTitle
        from="5.2"
        to="5.3"
        migrationExplanation={t(
          'migrationDialog.migration53.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#53"
      />
      <ChangeSetBox type="primary">
        <ChangeSetBoxTitle title={t('migrationDialog.migration53.title')} />
        <ChangeSetText
          text={t('migrationDialog.migration53.changeExplanation')}
        />
        <ChangeSetAddedProperty
          propertyName={`${t('migrationDialog.migration53.initializedTo')}: "${props.changes.metadataUnencrypted.backstage.entityRef}"`}
          newValue={''}
        />
      </ChangeSetBox>
    </>
  );
}
