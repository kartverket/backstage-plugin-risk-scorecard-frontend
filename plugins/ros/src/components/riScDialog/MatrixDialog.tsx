import { ConsequenceTableInfoWithHeaders } from '../scenarioWizard/components/ConsequenceTable';
import CloseIcon from '@mui/icons-material/Close';
import { ProbabilityTableInfoWithHeaders } from '../scenarioWizard/components/ProbabilityTable';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button, Text } from '@backstage/ui';

export function MatrixDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Dialog maxWidth="lg" open={open} onClose={close}>
      <DialogTitle>{t('scenarioDrawer.riskMatrixModal.title')}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={close}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Text as="p" variant="body-large" style={{ paddingBottom: '32px' }}>
          {t('scenarioStepper.initialRiskStep.subtitle')}
        </Text>
        <Box>
          <Text
            variant="title-x-small"
            weight="bold"
            style={{ paddingBottom: '4px' }}
          >
            {t('dictionary.probability')}
          </Text>
        </Box>
        <ProbabilityTableInfoWithHeaders />
        <Box>
          <Text
            variant="title-x-small"
            weight="bold"
            style={{ paddingTop: '32px', paddingBottom: '4px' }}
          >
            {t('dictionary.consequence')}
          </Text>
        </Box>
        <ConsequenceTableInfoWithHeaders />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('dictionary.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
