import classNames from 'classnames';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Button } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions.ts';
import styles from './ActionsCountButton.module.css';

type ActionsCountButtonProps = {
  type: UpdatedStatusEnumType;
  count: number;
  onActionCountClick: (type: UpdatedStatusEnumType) => void;
  isSelected: boolean;
};
export function ActionsCountButton(props: ActionsCountButtonProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const className = classNames(styles.OutdatedActionsCountButton, {
    [styles['OutdatedActionsCountButton--selected']]: props.isSelected,
    [styles['OutdatedActionsCountButton--very-outdated']]:
      props.type === UpdatedStatusEnum.VERY_OUTDATED,
    [styles['OutdatedActionsCountButton--outdated']]:
      props.type === UpdatedStatusEnum.OUTDATED,
    [styles['OutdatedActionsCountButton--updated']]:
      props.type === UpdatedStatusEnum.UPDATED,
  });

  const closeIndicatorClassName = classNames(
    styles.OutdatedActionsCountCloseIcon,
    'ri-close-line ri-lg',
  );

  const closeIndicator = props.isSelected ? (
    <i className={closeIndicatorClassName} />
  ) : undefined;

  const translationKey = (() => {
    if (props.type === UpdatedStatusEnum.VERY_OUTDATED) {
      return 'filterButton.veryOutdated';
    } else if (props.type === UpdatedStatusEnum.OUTDATED) {
      return 'filterButton.outdated';
    }
    return 'filterButton.listUpdatedActions';
  })();

  return (
    <Button
      className={className}
      size="small"
      onClick={() => props.onActionCountClick(props.type)}
      iconEnd={closeIndicator}
    >
      {t(translationKey)} ({props.count})
    </Button>
  );
}
