import { Flex, Text } from '@backstage/ui';
import {
  RiScStatusEnum,
  RiScStatusEnumType,
  StatusIconMapType,
} from './utils.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

interface StatusBadgeProps {
  riScStatus: RiScStatusEnumType;
}

export function StatusBadge(props: StatusBadgeProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const statusMap: StatusIconMapType = {
    [RiScStatusEnum.CREATED]: {
      icon: 'ri-edit-line',
      text: t('rosStatus.statusBadge.created'),
    },
    [RiScStatusEnum.DRAFT]: {
      icon: 'ri-edit-line',
      text: t('rosStatus.statusBadge.draft'),
    },
    [RiScStatusEnum.WAITING]: {
      icon: 'ri-hourglass-line',
      text: t('rosStatus.statusBadge.waiting'),
    },
    [RiScStatusEnum.PUBLISHED]: {
      icon: 'ri-checkbox-circle-line',
      text: t('rosStatus.statusBadge.published'),
    },
    [RiScStatusEnum.DELETION_DRAFT]: {
      icon: 'ri-delete-bin-line',
      text: t('rosStatus.statusBadge.draftDeletion'),
    },
    [RiScStatusEnum.DELETION_WAITING]: {
      icon: 'ri-close-circle-line',
      text: t('rosStatus.statusBadge.waitingDeletion'),
    },
  };

  return (
    <Flex direction="row" align="center" gap="2">
      <i
        className={statusMap[props.riScStatus].icon}
        style={{ fontSize: '20px' }}
      />
      <Text as="p" variant="body-large" weight="bold">
        {statusMap[props.riScStatus].text}
      </Text>
    </Flex>
  );
}
