import { MigrationTitle } from './components/MigrationTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

export function RiScMigrationChanges54() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <MigrationTitle
      from="5.3"
      to="5.4"
      migrationExplanation={t('migrationDialog.migration54.changeExplanation')}
      changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#54"
    />
  );
}
