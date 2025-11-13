import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../../common/mixins';
import { Flex } from '@backstage/ui';

interface CloseConfirmationProps {
  isOpen: boolean;
  onCloseDialog?: () => void;
  close: () => void;
  save: () => void;
}

export function CloseConfirmation({
  isOpen,
  onCloseDialog,
  close,
  save,
}: CloseConfirmationProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Dialog open={isOpen} disablePortal>
      <Flex>
        <DialogTitle>{t('scenarioDrawer.closeConfirmation')}</DialogTitle>
        <Button onClick={onCloseDialog}>
          <i className="ri-close-large-line" />
        </Button>
      </Flex>
      <DialogActions sx={dialogActions}>
        <Button variant="outlined" onClick={close}>
          {t('dictionary.discardChanges')}
        </Button>

        <Button variant="contained" onClick={save}>
          {t('dictionary.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
