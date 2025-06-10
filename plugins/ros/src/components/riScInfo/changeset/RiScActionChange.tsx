import { Action } from '../../../utils/types';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface RiScWholeActionChangeProps {
  action: Action;
  type: 'ADDED' | 'DELETED';
}

export function RiScActionChange({ action, type }: RiScWholeActionChangeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetTags>
        {type === 'ADDED' ? (
          <ChangeSetTag text={t('dictionary.added')} type="added" />
        ) : (
          <ChangeSetTag text={t('dictionary.removed')} type="delete" />
        )}
        <ChangeSetTag text={t('dictionary.action')} type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={action.title} />
      <ChangeSetProperty
        title={t('dictionary.description')}
        value={action.description}
      />
      {action.url && (
        <ChangeSetProperty title={t('dictionary.url')} value={action.url} />
      )}
      <ChangeSetProperty
        title={t('dictionary.status')}
        /* @ts-ignore Because ts can't typecheck strings against our keys */
        value={t(`actionStatus.${action.status}`)}
      />
    </ChangeSetBox>
  );
}
