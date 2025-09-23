import { ActionChange } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { ChangeSetChangedTitle } from './components/ChangeSetChangedTitle.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { formatDate } from '../../../utils/utilityfunctions.ts';

interface RiScActionChangeSetProps {
  action: ActionChange;
}

export function RiScActionChangeSet({ action }: RiScActionChangeSetProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetTags>
        <ChangeSetTag text={t('dictionary.action')} type="primary" />
      </ChangeSetTags>
      <ChangeSetChangedTitle title={action.title} />
      <ChangeSetTrackedProperty
        title={t('dictionary.description')}
        property={action.description}
        multiline={true}
        stringOnUndefinedProperty={t('comparisonDialog.noDescription')}
      />
      <ChangeSetTrackedProperty
        title={t('dictionary.url')}
        property={action.url}
        stringOnUndefinedProperty={t('comparisonDialog.noURL')}
      />
      <ChangeSetTrackedProperty
        title={t('dictionary.status')}
        property={action.status}
        /* @ts-ignore Because ts can't typecheck strings against our keys */
        valueFormatter={actionValue => t(`actionStatus.${actionValue}`)}
      />
      <ChangeSetTrackedProperty
        title={t('scenarioDrawer.action.lastUpdated')}
        property={action.lastUpdated}
        valueFormatter={actionValue =>
          actionValue
            ? formatDate(actionValue)
            : t('scenarioDrawer.action.notUpdated')
        }
      />
    </ChangeSetBox>
  );
}
