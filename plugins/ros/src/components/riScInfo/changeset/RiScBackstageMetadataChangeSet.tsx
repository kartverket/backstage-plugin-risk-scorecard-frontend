import { BackstageMetadataChange } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';

type RiScBackstageMetadataChangeSetProps = {
  backstageMetadataChange?: BackstageMetadataChange;
};

export function RiScBackstageMetadataChangeSet(
  props: RiScBackstageMetadataChangeSetProps,
) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (!props.backstageMetadataChange) return null;

  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        <ChangeSetTag
          text={t('dictionary.metadataUnencrypted')}
          type="primary"
        />
      </ChangeSetTags>
      <ChangeSetBoxTitle
        title={t('comparisonDialog.metadata.backstage.changes')}
      />
      <ChangeSetBox type="secondary">
        <ChangeSetTrackedProperty
          title={`${t('comparisonDialog.metadata.backstage.entityRef')}:`}
          property={props.backstageMetadataChange.entityRef}
        />
      </ChangeSetBox>
    </ChangeSetBox>
  );
}
