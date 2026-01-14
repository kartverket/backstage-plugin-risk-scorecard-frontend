import { MigrationChanges53 } from '../../../utils/types.ts';
import { ChangeSetBox } from '../changeset/components/ChangeSetBox.tsx';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { ChangeSetBoxTitle } from '../changeset/components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

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
          'migrationDialog.migration51.changeExplanation',
        )}
        changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#53"
      />
      <ChangeSetBox type="primary">
        <ChangeSetBoxTitle title={'5.3 is out!!'} />
        <h1>{JSON.stringify(props)}</h1>
      </ChangeSetBox>
    </>
  );
}
