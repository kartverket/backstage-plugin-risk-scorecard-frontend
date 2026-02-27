import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { UpdatedStatusEnumType } from '../../utils/utilityfunctions';
import { StatusIcon, StatusIconTypes } from './StatusIcon.tsx';

type UpdatedStatusBadgeProps = {
  status?: UpdatedStatusEnumType | 'UPDATING' | 'NONE';
};

export function UpdatedStatusBadge(props: UpdatedStatusBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (props.status === 'UPDATED') {
    return (
      <StatusIcon
        type={StatusIconTypes.Green}
        tooltipText={t('rosStatus.updated')}
        ariaLabel={t('rosStatus.updated')}
        size="large"
      />
    );
  }

  if (props.status === 'UPDATING') {
    return (
      <StatusIcon
        type={StatusIconTypes.Loading}
        tooltipText={t('rosStatus.updating')}
        size="large"
      />
    );
  }

  if (props.status === 'VERY_OUTDATED') {
    return (
      <StatusIcon
        type={StatusIconTypes.Red}
        tooltipText={t('rosStatus.updatedStatus.tooltip.VERY_OUTDATED')}
        ariaLabel={t('rosStatus.veryOutdated')}
        size="large"
      />
    );
  }

  if (props.status === 'OUTDATED') {
    return (
      <StatusIcon
        type={StatusIconTypes.Yellow}
        tooltipText={t('rosStatus.updatedStatus.tooltip.OUTDATED')}
        ariaLabel={t('rosStatus.outdated')}
        size="large"
      />
    );
  }
  return <StatusIcon type={StatusIconTypes.Error} size="large" />;
}
