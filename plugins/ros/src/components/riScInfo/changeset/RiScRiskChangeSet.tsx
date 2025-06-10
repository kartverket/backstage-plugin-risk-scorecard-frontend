import {
  ScenarioRiskChange,
  SimpleTrackedProperty,
} from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { formatNOK } from '../../../utils/utilityfunctions.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScRiskChangeSetProps {
  title: string;
  risk: SimpleTrackedProperty<ScenarioRiskChange>;
}

export function RiScRiskChangeSet({ title, risk }: RiScRiskChangeSetProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  if (risk.type !== 'CONTENT_CHANGED' && risk.type !== 'UNCHANGED')
    return <></>;
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetBoxTitle title={title} />
      <ChangeSetTrackedProperty
        title={t('dictionary.summary')}
        property={risk.value.summary}
        compact={true}
        emphasised={true}
      />
      <ChangeSetTrackedProperty
        title={t('dictionary.probability')}
        property={risk.value.probability}
        compact={true}
        unit={t('comparisonDialog.risk.probabilityUnit')}
        emphasised={true}
      />
      <ChangeSetTrackedProperty
        title={t('dictionary.consequence')}
        property={risk.value.consequence}
        compact={true}
        unit={t('comparisonDialog.risk.consequenceUnit')}
        emphasised={true}
        valueFormatter={formatNOK}
      />
    </ChangeSetBox>
  );
}
