import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { dialogActions } from '../../common/mixins';
import type { SetState } from '../../../utils/types';

type DeleteScenarioConfirmationProps = {
  isOpen: ConfirmationDialogProps['isOpen'];
  setIsOpen: SetState<ConfirmationDialogProps['isOpen']>;
  onConfirm?: ConfirmationDialogProps['onConfirm'];
};

export function DeleteScenarioConfirmation({
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteScenarioConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={() => {
        setIsOpen(false);
        onConfirm?.();
      }}
      title={t('scenarioDrawer.deleteScenarioConfirmation')}
      confirmButtonText={t('scenarioDrawer.deleteScenarioButton')}
    />
  );
}

// #####################################################

type DeleteActionConfirmationProps = {
  isOpen: ConfirmationDialogProps['isOpen'];
  setIsOpen: SetState<ConfirmationDialogProps['isOpen']>;
  onConfirm?: ConfirmationDialogProps['onConfirm'];
};

export function DeleteActionConfirmation({
  isOpen,
  setIsOpen,
  onConfirm,
}: DeleteActionConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={() => {
        setIsOpen(false);
        onConfirm?.();
      }}
      title={t('scenarioDrawer.deleteActionConfirmation')}
      confirmButtonText={t('scenarioDrawer.deleteActionButton')}
    />
  );
}

// #####################################################

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
  confirmButtonText: string;
};

/**
 * Helper component.
 */
function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmButtonText,
}: ConfirmationDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Dialog open={isOpen} onClose={onClose} disablePortal>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button
          variant="outlined"
          onClick={event => {
            event.stopPropagation();
            onClose?.();
          }}
        >
          {t('dictionary.cancel')}
        </Button>
        <Button
          onClick={event => {
            event.stopPropagation();
            onConfirm?.();
          }}
          variant="contained"
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
