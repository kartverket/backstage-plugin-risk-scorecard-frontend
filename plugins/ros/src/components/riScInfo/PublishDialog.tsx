import { ReactComponentElement, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DifferenceFetchState } from '../../utils/types';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDifferenceDialog } from './riScStatus/RiScDifferenceDialog';
import { dialogActions } from '../common/mixins';

interface RiScPublishDialogProps {
  openDialog: boolean;
  isDeletion: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
  differenceFetchState: DifferenceFetchState;
}

export const RiScPublishDialog = ({
  openDialog,
  isDeletion,
  handleCancel,
  handlePublish,
  differenceFetchState,
}: RiScPublishDialogProps): ReactComponentElement<any> => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [riskOwnerApproves, setRiskOwnerApproves] = useState<boolean>(false);

  function handleCheckboxInput(event: React.ChangeEvent<HTMLInputElement>) {
    setRiskOwnerApproves(event.target.checked);
  }

  return (
    <Dialog maxWidth="md" open={openDialog}>
      <DialogTitle>
        {isDeletion
          ? t('publishDialog.titleDelete')
          : t('publishDialog.titleUpdate')}
      </DialogTitle>
      <DialogContent sx={{ marginBottom: '16px' }}>
        <>
          {!isDeletion && (
            <RiScDifferenceDialog differenceFetchState={differenceFetchState} />
          )}
          <Alert severity="info" icon={false}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={riskOwnerApproves}
                  onChange={handleCheckboxInput}
                />
              }
              label={
                isDeletion
                  ? t('publishDialog.checkboxLabelDelete')
                  : t('publishDialog.checkboxLabelUpdate')
              }
            />
          </Alert>
        </>
      </DialogContent>
      <DialogActions sx={dialogActions}>
        <Button variant="outlined" color="primary" onClick={handleCancel}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePublish}
          disabled={!riskOwnerApproves}
        >
          {t('dictionary.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
