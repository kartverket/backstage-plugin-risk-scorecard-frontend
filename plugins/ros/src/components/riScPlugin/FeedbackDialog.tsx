
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
} from '@mui/material/';

import { useTranslationRef} from "@backstage/core-plugin-api/alpha";
import { pluginRiScTranslationRef } from "../../utils/translations";

type FeedbackDialogProps = {
    open: boolean;
    feedbackText: string;
    feedbackSent: boolean;
    setFeedbackText: (text: string) => void;
    setFeedbackSent: (sent: boolean) => void;
    onClose: () => void;
    onSend: () => void;
};

export function FeedbackDialog({
    open,
    feedbackText,
    feedbackSent,
    setFeedbackText,
    setFeedbackSent,
    onClose,
    onSend,
}: FeedbackDialogProps) {
    const {t} = useTranslationRef(pluginRiScTranslationRef);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"sm"}>
            {!feedbackSent && <DialogTitle>{t('feedbackDialog.title')}</DialogTitle>}
            <DialogContent>
                {feedbackSent ? (
                    <Typography
                        align="center"
                        variant="h4"
                        sx={{py: 8}}
                    >
                        {t('feedbackDialog.confirmationMessage')}
                    </Typography>
                ) : (
                    <TextField
                        margin="dense"
                        label={t('feedbackDialog.description')}
                        fullWidth
                        multiline
                        minRows={4}
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                    />
                )}
            </DialogContent>
            <DialogActions>
                {feedbackSent ? (
                    <Button
                        onClick={onClose}>
                        {t('dictionary.close')}
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose}>
                            {t('dictionary.cancel')}
                        </Button>
                        <Button
                            onClick={async () => {
                                await onSend();
                                setFeedbackSent(true);
                            }}
                            disabled={!feedbackText.trim()}
                            variant="contained"
                        >
                            Send
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}