import {
  Risk,
} from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { formatNOK } from '../../../utils/utilityfunctions.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScWholeRiskChangeProps {
  title: string;
  risk: Risk;
}

export function RiScRiskChange({ title, risk }: RiScWholeRiskChangeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetBoxTitle title={title} />
      {risk.summary && (
        <ChangeSetProperty
          title={t('dictionary.summary')}
          value={risk.summary}
          compact={true}
          emphasised={true}
        />
      )}
      <ChangeSetProperty
        title={t('dictionary.probability')}
        value={risk.probability}
        compact={true}
        unit={t('comparisonDialog.risk.probabilityUnit')}
        emphasised={true}
      />
      <ChangeSetProperty
        title={t('dictionary.consequence')}
        value={formatNOK(risk.consequence)}
        compact={true}
        unit={t('comparisonDialog.risk.consequenceUnit')}
        emphasised={true}
      />
    </ChangeSetBox>
  );
}
