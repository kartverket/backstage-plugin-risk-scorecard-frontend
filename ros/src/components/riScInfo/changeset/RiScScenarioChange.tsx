import { Scenario } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { RiScActionChange } from './RiScActionChange.tsx';
import { ChangeSetTwoColumnSplit } from './components/ChangeSetTwoColumnSplit.tsx';
import { ChangeSetColumn } from './components/ChangeSetColumn.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { RiScRiskChange } from './RiScRiskChange.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScWholeScenarioChangeProps {
  scenario: Scenario;
  type: 'ADDED' | 'DELETED';
}

export function RiScScenarioChange({
  scenario,
  type,
}: RiScWholeScenarioChangeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        {type === 'ADDED' ? (
          <ChangeSetTag text={t('dictionary.added')} type="added" />
        ) : (
          <ChangeSetTag text={t('dictionary.removed')} type="delete" />
        )}
        <ChangeSetTag text={t('dictionary.scenario')} type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={scenario.title} />
      <ChangeSetProperty
        title={t('dictionary.description')}
        value={
          scenario.description ? (
            scenario.description
          ) : (
            <i>{t('comparisonDialog.noDescription')}</i>
          )
        }
        emphasised={true}
      />
      {scenario.url && (
        <ChangeSetProperty
          title={t('dictionary.url')}
          value={scenario.url}
          emphasised={true}
        />
      )}
      {(scenario.threatActors.length > 0 ||
        scenario.vulnerabilities.length > 0) && (
        <ChangeSetTwoColumnSplit>
          {scenario.threatActors.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title={t('dictionary.threatActors')}
                value={
                  <>
                    {scenario.threatActors.map(actor => (
                      /* @ts-ignore Because ts can't typecheck strings against our keys */
                      <div>{t(`threatActors.${actor}`)}</div>
                    ))}
                  </>
                }
                emphasised={true}
              />
            </ChangeSetColumn>
          )}
          {scenario.vulnerabilities.length > 0 && (
            <ChangeSetColumn>
              <ChangeSetProperty
                title={t('dictionary.vulnerabilities')}
                value={
                  <>
                    {scenario.vulnerabilities.map(vulnerability => (
                      /* @ts-ignore Because ts can't typecheck strings against our keys */
                      <div>{t(`vulnerabilities.${vulnerability}`)}</div>
                    ))}
                  </>
                }
                emphasised={true}
              />
            </ChangeSetColumn>
          )}
        </ChangeSetTwoColumnSplit>
      )}

      <ChangeSetTwoColumnSplit>
        <ChangeSetColumn column="1">
          <RiScRiskChange
            title={t('dictionary.initialRisk')}
            risk={scenario.risk}
          />
        </ChangeSetColumn>
        <ChangeSetColumn column="2">
          <RiScRiskChange
            title={t('dictionary.restRisk')}
            risk={scenario.remainingRisk}
          />
        </ChangeSetColumn>
      </ChangeSetTwoColumnSplit>

      {scenario.actions &&
        scenario.actions.map(action => (
          <RiScActionChange action={action} type={type} />
        ))}
    </ChangeSetBox>
  );
}
