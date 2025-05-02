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

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  titleKey,
  confirmButtonKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titleKey: string;
  confirmButtonKey: string;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Dialog open={isOpen}>
      {/* @ts-ignore */}
      <DialogTitle>{t(titleKey)}</DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained">
          {/* @ts-ignore */}
          {t(confirmButtonKey)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DeleteConfirmation({
  deleteConfirmationIsOpen,
  setDeleteConfirmationIsOpen,
}: {
  deleteConfirmationIsOpen: boolean;
  setDeleteConfirmationIsOpen: (deleteConfirmationIsOpen: boolean) => void;
}) {
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { scenario } = useScenario();

  const handleConfirm = () => {
    setDeleteConfirmationIsOpen(false);
    deleteScenario(riSc, updateRiSc, scenario);
  };

  return (
    <ConfirmationDialog
      isOpen={deleteConfirmationIsOpen}
      onClose={() => setDeleteConfirmationIsOpen(false)}
      onConfirm={handleConfirm}
      titleKey="scenarioDrawer.deleteScenarioConfirmation"
      confirmButtonKey="scenarioDrawer.deleteScenarioButton"
    />
  );
}

export function DeleteActionConfirmation({
  deleteActionConfirmationIsOpen,
  setDeleteActionConfirmationIsOpen,
  onConfirm,
}: {
  deleteActionConfirmationIsOpen: boolean;
  setDeleteActionConfirmationIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmationDialog
      isOpen={deleteActionConfirmationIsOpen}
      onClose={() => setDeleteActionConfirmationIsOpen(false)}
      onConfirm={() => {
        setDeleteActionConfirmationIsOpen(false);
        onConfirm();
      }}
      titleKey="scenarioDrawer.deleteActionConfirmation"
      confirmButtonKey="scenarioDrawer.deleteActionButton"
    />
  );
}
