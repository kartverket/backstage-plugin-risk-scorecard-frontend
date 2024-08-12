import React from 'react';
import { ConsequenceTableInfoWithHeaders } from '../scenarioWizard/components/ConsequenceTable';
import CloseIcon from '@mui/icons-material/Close';
import { ProbabilityTableInfoWithHeaders } from '../scenarioWizard/components/ProbabilityTable';
import { heading3 } from '../common/typography';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export const MatrixDialog = ({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) => {
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
        <Typography
          sx={{
            paddingBottom: '32px',
          }}
        >
          {t('scenarioStepper.initialRiskStep.subtitle')}
        </Typography>
        <Box>
          <Typography sx={{ ...heading3, paddingBottom: '4px' }}>
            {t('dictionary.probability')}
          </Typography>
        </Box>
        <ProbabilityTableInfoWithHeaders />
        <Box>
          <Typography
            sx={{ ...heading3, paddingTop: '16px', paddingBottom: '4px' }}
          >
            {t('dictionary.consequence')}
          </Typography>
        </Box>
        <ConsequenceTableInfoWithHeaders />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('dictionary.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
