import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material/';

import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useState } from 'react';
import { dialogActions } from '../common/mixins.ts';
import { AddComment } from '@material-ui/icons';
import { useAuthenticatedFetch } from '../../utils/hooks.ts';
import Alert from "@mui/material/Alert";

export function FeedbackDialog() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { postFeedback } = useAuthenticatedFetch();

  const [open, setOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const onClose = () => {
    setOpen(false);
    setFeedbackText('');
    setFeedbackSent(false);
    setFeedbackError(null);
  };

  return (
    <>
      <Button
        variant="text"
        startIcon={<AddComment />}
        color="primary"
        onClick={() => setOpen(true)}
      >
        {t('feedbackDialog.feedbackButton')}
      </Button>

      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>{t('feedbackDialog.title')}</DialogTitle>
        <DialogContent>
            <>
              <TextField
                margin="dense"
                label={t('feedbackDialog.description')}
                fullWidth
                multiline
                minRows={4}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                disabled={feedbackSent}
              />
              {feedbackError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {feedbackError}
                </Alert>
              )}
              {feedbackSent &&
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {t('feedbackDialog.confirmationMessage')}
                  </Alert>}
            </>
        </DialogContent>
        <DialogActions sx={dialogActions}>
          {feedbackSent ? (
            <Button onClick={onClose} variant="outlined">
              {t('dictionary.close')}
            </Button>
          ) : (
            <>
              <Button onClick={onClose} variant="outlined">
                {t('dictionary.cancel')}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await postFeedback(feedbackText);
                    setFeedbackSent(true);
                  } catch (error: any) {
                    setFeedbackError(t('feedbackDialog.errorMessage'));
                  }
                }}
                disabled={!feedbackText.trim()}
                variant="contained"
              >
                {t('feedbackDialog.sendButton')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
