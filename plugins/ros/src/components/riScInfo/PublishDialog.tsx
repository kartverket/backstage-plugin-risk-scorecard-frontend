import { ReactComponentElement, useState } from 'react';
import Alert from '@mui/material/Alert';
import { Button } from '@backstage/ui';

import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DifferenceFetchState } from '../../utils/types';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDifferenceDialog } from './riScStatus/RiScDifferenceDialog';
import { Flex } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';
import DialogComponent from '../dialog/DialogComponent';

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
    <DialogComponent
      isOpen={openDialog}
      onClick={handleCancel}
      header={
        isDeletion
          ? t('publishDialog.titleDelete')
          : t('publishDialog.titleUpdate')
      }
      className={styles.riScInfoDialog}
    >
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
      <Flex justify="between" pt="24px">
        <Button size="medium" variant="secondary" onClick={handleCancel}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          size="medium"
          variant="primary"
          onClick={handlePublish}
          isDisabled={!riskOwnerApproves}
        >
          {t('dictionary.confirm')}
        </Button>
      </Flex>
    </DialogComponent>
  );
};
