import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Button from '@mui/material/Button';
import styles from '../scenarioWizard.module.css';
import {
  Text,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
} from '@backstage/ui';

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
    <DialogTrigger>
      <Dialog
        isOpen={isOpen}
        onOpenChange={onCloseDialog}
        className={styles.scenarioWizardDialog}
      >
        <DialogHeader>
          <Text variant="title-x-small" weight="bold">
            {t('scenarioDrawer.closeConfirmation')}
          </Text>
        </DialogHeader>
        <DialogBody className={styles.scenarioWizardDialogBody}>
          <Button variant="outlined" onClick={close}>
            {t('dictionary.discardChanges')}
          </Button>

          <Button variant="contained" onClick={save}>
            {t('dictionary.save')}
          </Button>
        </DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}
