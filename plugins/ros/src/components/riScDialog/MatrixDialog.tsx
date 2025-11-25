import { ConsequenceTableInfoWithHeaders } from '../scenarioWizard/components/ConsequenceTable';
import { ProbabilityTableInfoWithHeaders } from '../scenarioWizard/components/ProbabilityTable';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import {
  Button,
  Text,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from '@backstage/ui';
import styles from './RiScDialog.module.css';

export function MatrixDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <DialogTrigger>
      <Dialog
        isOpen={open}
        onOpenChange={close}
        className={styles.matrixDialog}
      >
        <DialogHeader>
          <Text variant="title-x-small" weight="bold">
            {t('scenarioDrawer.riskMatrixModal.title')}
          </Text>
        </DialogHeader>
        <DialogBody>
          <Text as="p" variant="body-large" className={styles.matrixDialogBody}>
            {t('scenarioStepper.initialRiskStep.subtitle')}
          </Text>
          <Box>
            <Text variant="title-x-small" weight="bold">
              {t('dictionary.probability')}
            </Text>
          </Box>
          <ProbabilityTableInfoWithHeaders />
          <Box>
            <Text variant="title-x-small" weight="bold">
              {t('dictionary.consequence')}
            </Text>
          </Box>
          <ConsequenceTableInfoWithHeaders />
        </DialogBody>
        <DialogFooter className={styles.matrixDialogFooter}>
          <Button onClick={close}>{t('dictionary.close')}</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
