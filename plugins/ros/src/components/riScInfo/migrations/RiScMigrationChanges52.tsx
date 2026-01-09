import { MigrationChanges52 } from '../../../utils/types.ts';
import { MigrationTitle } from './components/MigrationTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScMigrationChanges52Props {
  changes: MigrationChanges52;
}

export function RiScMigrationChanges52({
  changes,
}: RiScMigrationChanges52Props) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const hasRemovedValuations = (changes.removedValuationsCount ?? 0) > 0;

  if (!hasRemovedValuations) return null;

  return (
    <MigrationTitle
      from="5.1"
      to="5.2"
      migrationExplanation={t('migrationDialog.migration52.changeExplanation')}
      changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#52"
    />
  );
}