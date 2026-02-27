import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import type { SetState } from '../../../utils/types';
import styles from '../components/ScenarioDrawer.module.css';
import { ConfirmationDialogWithoutCheckbox } from '../../common/ConfirmationDialog';

type DeleteScenarioConfirmationProps = {
  isOpen: boolean;
  setIsOpen: SetState<boolean>;
  onConfirm?: () => void;
};

export function DeleteScenarioConfirmation({
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteScenarioConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialogWithoutCheckbox
      isOpen={isOpen}
      onCancel={() => setIsOpen(false)}
      onConfirm={() => {
        setIsOpen(false);
        onConfirm?.();
      }}
      title={t('scenarioDrawer.deleteScenarioConfirmation')}
      confirmButtonText={t('scenarioDrawer.deleteScenarioButton')}
      className={styles.deleteConfirmationDialog}
    />
  );
}

type DeleteActionConfirmationProps = {
  isOpen: boolean;
  setIsOpen: SetState<boolean>;
  onConfirm?: () => void;
};

export function DeleteActionConfirmation({
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteActionConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialogWithoutCheckbox
      isOpen={isOpen}
      onCancel={() => setIsOpen(false)}
      onConfirm={() => {
        setIsOpen(false);
        onConfirm?.();
      }}
      title={t('scenarioDrawer.deleteActionConfirmation')}
      confirmButtonText={t('scenarioDrawer.deleteActionButton')}
      className={styles.deleteConfirmationDialog}
    />
  );
}
