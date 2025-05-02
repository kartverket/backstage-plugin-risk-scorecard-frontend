import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { dialogActions } from '../../common/mixins';
import { useScenario } from '../../../contexts/ScenarioContext';
import { useRiScs } from '../../../contexts/RiScContext';
import { deleteScenario } from '../../../utils/utilityfunctions';
import type { SetState } from '../../../utils/types';

type DeleteConfirmationProps = {
  isOpen: ConfirmationDialogProps['isOpen'];
  setIsOpen: SetState<ConfirmationDialogProps['isOpen']>;
  onConfirm?: ConfirmationDialogProps['onConfirm'];
};

export function DeleteConfirmation({
  isOpen,
  setIsOpen,
}: DeleteConfirmationProps) {
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { scenario } = useScenario();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function handleConfirm() {
    setIsOpen(false);
    deleteScenario(riSc, updateRiSc, scenario);
  }

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleConfirm}
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

  function handleConfirm() {
    setIsOpen(false);
    onConfirm?.();
  }

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleConfirm}
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
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained">
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
