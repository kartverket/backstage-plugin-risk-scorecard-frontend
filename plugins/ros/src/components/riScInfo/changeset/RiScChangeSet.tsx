import { DifferenceFetchState } from '../../../utils/types.ts';
import { RiScMigrationChanges } from '../migrations/RiScMigrationChanges.tsx';
import { ChangeSetTitle } from './components/ChangeSetTitle.tsx';
import { RiScScenarioChangeSet } from './RiScScenarioChangeSet.tsx';
import { RiScScenarioChange } from './RiScScenarioChange.tsx';
import { dtoToScenario } from '../../../utils/DTOs.ts';
import { ChangeSetSimpleBox } from './components/ChangeSetSimpleBox.tsx';
import { RiScValuationChange } from './RiScValuationChange.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

type RiScChangeSetProps = {
  changeset: DifferenceFetchState;
};

export function RiScChangeSet({ changeset }: RiScChangeSetProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const migrationChanges = changeset.differenceState.migrationChanges;
  const changes = changeset.differenceState;

  const hasChanges =
    changes.scenarios.length > 0 ||
    changes.valuations.length > 0 ||
    changes.title ||
    changes.scope;

  const hasAnyChanges = changes.migrationChanges.migrationChanges || hasChanges;

  if (!hasAnyChanges) {
    return <i>{t('comparisonDialog.noChanges')}</i>;
  }

  return (
    <div>
      {migrationChanges.migrationVersions?.fromVersion !==
        migrationChanges.migrationVersions?.toVersion && (
        <RiScMigrationChanges migrationStatus={migrationChanges} />
      )}
      {hasChanges && (
        <>
          <ChangeSetTitle text={t('comparisonDialog.changes')} />
          <ChangeSetSimpleBox
            prop={changes.title}
            title={t('dictionary.title')}
          />
          <ChangeSetSimpleBox
            prop={changes.scope}
            title={t('dictionary.scope')}
          />
          {changes.valuations.map(valuation => (
            <RiScValuationChange valuation={valuation} />
          ))}
          {changes.scenarios.map(scenario => (
            <>
              {(scenario.type === 'ADDED' || scenario.type === 'DELETED') && (
                <RiScScenarioChange
                  scenario={dtoToScenario(
                    scenario.type === 'ADDED'
                      ? scenario.newValue
                      : scenario.oldValue,
                  )}
                  type={scenario.type}
                />
              )}
              {scenario.type === 'CONTENT_CHANGED' && (
                <RiScScenarioChangeSet scenario={scenario.value} />
              )}
            </>
          ))}
        </>
      )}
    </div>
  );
}
