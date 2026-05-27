import { MigrationTitle } from './components/MigrationTitle.tsx';

export function RiScMigrationChanges53() {
  return (
    <MigrationTitle
      from="5.2"
      to="5.3"
      migrationExplanation=""
      changelogUrl="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md#53"
    />
  );
}
