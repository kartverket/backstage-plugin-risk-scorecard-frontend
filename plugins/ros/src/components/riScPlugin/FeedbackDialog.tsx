import { TextField } from '@mui/material/';
import { Button, Text, Flex } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useState } from 'react';
import { useAuthenticatedFetch } from '../../utils/hooks.ts';
import Alert from '@mui/material/Alert';

interface FeedbackDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function FeedbackDialog(props: FeedbackDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { postFeedback } = useAuthenticatedFetch();

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const onClose = () => {
    props.setOpen(false);
    setFeedbackText('');
    setFeedbackSent(false);
    setFeedbackError(null);
  };

  return (
    <Flex direction="column" gap="16px">
      <Text as="h3" variant="title-x-small" weight="bold">
        {t('feedbackDialog.title')}
      </Text>

      <>
        <TextField
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
        {feedbackSent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('feedbackDialog.confirmationMessage')}
          </Alert>
        )}
      </>
      {feedbackSent ? (
        <Flex pb="18px">
          <Button onClick={onClose} size="medium" variant="secondary">
            {t('dictionary.close')}
          </Button>
        </Flex>
      ) : (
        <Flex justify="between">
          <Button
            onClick={() => props.setOpen(false)}
            size="medium"
            variant="secondary"
          >
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
            isDisabled={!feedbackText.trim()}
            size="medium"
            variant="primary"
          >
            {t('feedbackDialog.sendButton')}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
