import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import { ConsequenceTableInfoWithHeaders } from '../scenarioWizard/components/ConsequenceTable';
import CloseIcon from '@mui/icons-material/Close';
import { ProbabilityTableInfoWithHeaders } from '../scenarioWizard/components/ProbabilityTable';
import { Box } from '@material-ui/core';
import { heading3 } from '../common/typography';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

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
      <DialogTitle>Risikomatriser</DialogTitle>
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
        <Button autoFocus onClick={close}>
          {t('dictionary.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
