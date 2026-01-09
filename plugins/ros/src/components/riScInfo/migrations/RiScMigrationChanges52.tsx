import { MigrationChanges52 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetTag } from '../changeset/components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { ChangeSetTags } from '../changeset/components/ChangeSetTags.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetChangedProperty } from '../changeset/components/ChangeSetChangedProperty.tsx';

interface RiScMigrationChanges52Props {
  changes: MigrationChanges52;
}

export function RiScMigrationChanges52({
  changes,
}: RiScMigrationChanges52Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const deletedValuations = changes.valuations;
  if (!deletedValuations || deletedValuations.type !== 'DELETED') return null;

  const count = Array.isArray(deletedValuations.oldValue)
    ? deletedValuations.oldValue.length
    : 0;

  return (
    <>
      <MigrationTitle
        from="5.1"
        to="5.2"
        migrationExplanation={t(
          'migrationDialog.migration52.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#52"
      />

      <ChangeSetBox type="primary">
        <ChangeSetTags>
          <ChangeSetTag
            type="primary"
            text={t('migrationDialog.schemaVersion')}
          />
        </ChangeSetTags>

        <ChangeSetBoxTitle title={t('migrationDialog.migration52.title')} />

        <ChangeSetChangedProperty
          propertyName={t('dictionary.valuation')}
          oldValue={`${t('migrationDialog.migration52.oldValue')}: ${count}`}
          newValue={t('migrationDialog.removed')}
        />
      </ChangeSetBox>
    </>
  );
}
