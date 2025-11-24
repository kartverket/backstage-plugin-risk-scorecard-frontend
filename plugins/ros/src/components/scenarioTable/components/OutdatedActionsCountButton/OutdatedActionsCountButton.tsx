import classNames from 'classnames';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../../utils/translations.ts';
import { Box, Button } from '@backstage/ui';
import {
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../../../utils/utilityfunctions.ts';
import styles from './OutdatedActionsCountButton.module.css';

type OutdatedActionsCountButtonProps = {
  type: UpdatedStatusEnumType;
  count: number;
  onToggle: (type: UpdatedStatusEnumType) => void;
  isSelected: boolean;
};
export function OutdatedActionsCountButton(
  props: OutdatedActionsCountButtonProps,
) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { onToggle } = props;

  const className = classNames(styles.OutdatedActionsCountButton, {
    [styles['OutdatedActionsCountButton--selected']]: props.isSelected,
    [styles['OutdatedActionsCountButton--very-outdated']]:
      props.type === UpdatedStatusEnum.VERY_OUTDATED,
    [styles['OutdatedActionsCountButton--outdated']]:
      props.type === UpdatedStatusEnum.OUTDATED,
    [styles['OutdatedActionsCountButton--updated']]:
      props.type === UpdatedStatusEnum.UPDATED,
  });

  const countIndicatorClassName = classNames(
    styles.OutdatedActionsCountIndicator,
    {
      [styles['OutdatedActionsCountIndicator--wide']]: props.count > 99,
    },
  );
  const countIndicator = (
    <Box className={countIndicatorClassName}>
      <span>{props.count}</span>
    </Box>
  );

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
      size="medium"
      onClick={() => onToggle(props.type)}
      iconStart={
        props.type !== UpdatedStatusEnum.UPDATED ? countIndicator : undefined
      }
      iconEnd={closeIndicator}
    >
      {t(translationKey)}
    </Button>
  );
}
