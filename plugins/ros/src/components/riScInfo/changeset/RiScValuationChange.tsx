import { SimpleTrackedProperty, Valuations } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScWholeValuationChangeProps {
  valuation: SimpleTrackedProperty<Valuations>;
}

export function RiScValuationChange({
  valuation,
}: RiScWholeValuationChangeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  if (valuation.type !== 'ADDED' && valuation.type !== 'DELETED') return <></>;
  const valuationContent =
    valuation.type === 'ADDED' ? valuation.newValue : valuation.oldValue;
  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        {valuation.type === 'ADDED' && (
          <ChangeSetTag text={t('dictionary.added')} type="added" />
        )}
        {valuation.type === 'DELETED' && (
          <ChangeSetTag text={t('dictionary.removed')} type="delete" />
        )}
        <ChangeSetTag text={t('dictionary.valuation')} type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={valuationContent.description} />
      <ChangeSetProperty
        title={t("dictionary.confidentiality")}
        /* @ts-ignore Because ts can't typecheck strings against our keys */
        value={t(`comparisonDialog.valuation.confidentiality.${valuationContent.confidentiality}`)}
        emphasised={true}
      />
      <ChangeSetProperty
        title={t('dictionary.availability')}
        /* @ts-ignore Because ts can't typecheck strings against our keys */
        value={t(`comparisonDialog.valuation.availability.${valuationContent.availability}`)}
        emphasised={true}
      />
      <ChangeSetProperty
        title={t('dictionary.integrity')}
        /* @ts-ignore Because ts can't typecheck strings against our keys */
        value={t(`comparisonDialog.valuation.integrity.${valuationContent.integrity}`)}
        emphasised={true}
      />
    </ChangeSetBox>
  );
}
