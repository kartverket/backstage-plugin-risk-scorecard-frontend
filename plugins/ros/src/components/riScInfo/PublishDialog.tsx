import { ReactComponentElement, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DifferenceFetchState } from '../../utils/types';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDifferenceDialog } from './riScStatus/RiScDifferenceDialog';
import {
  Text,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';

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
    <DialogTrigger>
      <Dialog
        isOpen={openDialog}
        onOpenChange={handleCancel}
        className={styles.riScInfoDialog}
      >
        <DialogHeader>
          <Text variant="title-small" weight="bold">
            {isDeletion
              ? t('publishDialog.titleDelete')
              : t('publishDialog.titleUpdate')}
          </Text>
        </DialogHeader>
        <DialogBody className={styles.riscInfoDialogBody}>
          <>
            {!isDeletion && (
              <RiScDifferenceDialog
                differenceFetchState={differenceFetchState}
              />
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
        </DialogBody>
        <DialogFooter className={styles.riscInfoDialogFooter}>
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
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
