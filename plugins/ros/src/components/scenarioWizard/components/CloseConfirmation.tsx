import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Button from '@mui/material/Button';
import styles from '../ScenarioWizard.module.css';
import { Flex } from '@backstage/ui';
import DialogComponent from '../../dialog/DialogComponent';

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
    <DialogComponent
      isOpen={isOpen}
      onClick={onCloseDialog || (() => {})}
      className={styles.scenarioWizardDialog}
      header={t('scenarioDrawer.closeConfirmation')}
    >
      <Flex justify="between">
        <Button variant="outlined" onClick={close}>
          {t('dictionary.discardChanges')}
        </Button>

        <Button variant="contained" onClick={save}>
          {t('dictionary.save')}
        </Button>
      </Flex>
    </DialogComponent>
  );
}
