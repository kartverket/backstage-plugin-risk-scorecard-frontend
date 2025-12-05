import { ConsequenceTableInfoWithHeaders } from '../scenarioWizard/components/ConsequenceTable';
import { ProbabilityTableInfoWithHeaders } from '../scenarioWizard/components/ProbabilityTable';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import { Text } from '@backstage/ui';
import styles from './RiScDialog.module.css';
import DialogComponent from '../dialog/DialogComponent';

export function MatrixDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <DialogComponent
      isOpen={open}
      onClick={close}
      header={t('scenarioDrawer.riskMatrixModal.title')}
      className={styles.matrixDialog}
    >
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
    </DialogComponent>
  );
}
