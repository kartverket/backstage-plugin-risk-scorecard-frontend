import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../../common/mixins';

interface CloseConfirmationProps {
  isOpen: boolean;
  close: () => void;
  save: () => void;
}

export function CloseConfirmation({
  isOpen,
  close,
  save,
}: CloseConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Dialog open={isOpen}>
      <DialogTitle>{t('scenarioDrawer.closeConfirmation')}</DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button variant="outlined" onClick={close}>
          {t('dictionary.discardChanges')}
        </Button>

        <Button variant="outlined" onClick={save}>
          {t('dictionary.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
