import { SimpleTrackedProperty } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { ChangeSetAddedValue } from './components/ChangeSetAddedValue.tsx';
import { ChangeSetRemovedValue } from './components/ChangeSetRemovedValue.tsx';
import { ChangeSetSimpleBox } from './components/ChangeSetSimpleBox.tsx';

interface RiScAppliesToChangeProps {
  appliesToChanges: SimpleTrackedProperty<string>[];
}

export function RiScAppliesToChange({
  appliesToChanges,
}: RiScAppliesToChangeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <ChangeSetBox type="primary">
      <ChangeSetBoxTitle title={t('dictionary.appliesTo')} />
      {appliesToChanges.map(entityChange => (
        <div key={JSON.stringify(entityChange)}>
          {entityChange.type === 'ADDED' && (
            <ChangeSetAddedValue newValue={entityChange.newValue} />
          )}
          {entityChange.type === 'DELETED' && (
            <ChangeSetRemovedValue oldValue={entityChange.oldValue} />
          )}
          {entityChange.type === 'CONTENT_CHANGED' && (
            <ChangeSetSimpleBox
              prop={entityChange}
              title={t('dictionary.appliesTo')}
            />
          )}
        </div>
      ))}
    </ChangeSetBox>
  );
}
