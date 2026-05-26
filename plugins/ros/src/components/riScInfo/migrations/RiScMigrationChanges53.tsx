import { MigrationTitle } from './components/MigrationTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

export function RiScMigrationChanges53() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <MigrationTitle
      from="5.2"
      to="5.3"
      migrationExplanation={t('migrationDialog.migration53.changeExplanation')}
      changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#53"
    />
  );
}
