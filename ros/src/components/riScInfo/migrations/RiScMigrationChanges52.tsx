import { MigrationTitle } from './components/MigrationTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

export function RiScMigrationChanges52() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <MigrationTitle
      from="5.1"
      to="5.2"
      migrationExplanation={t('migrationDialog.migration52.changeExplanation')}
      changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#52"
    />
  );
}
