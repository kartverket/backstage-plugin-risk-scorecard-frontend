import Alert from '@mui/material/Alert';
import styles from '../alertBar.module.css';
import { UpdateStatus } from '../../../contexts/RiScContext';
import { SubmitResponseObject } from '../../../utils/types';
import { AlertTitle, CircularProgress } from '@mui/material';
import { getAlertSeverity } from '../../../utils/utilityfunctions';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';

type Props = {
  updateStatus: UpdateStatus;
  response: SubmitResponseObject | null;
  statusText?: string;
};

function AlertBar({ updateStatus, response, statusText }: Props) {
  const severity = getAlertSeverity(updateStatus, response ?? undefined);
  const severityClass = (styles as any)[severity] || '';
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  if (!updateStatus) return null; // Prevents error if prop is missing

  if (updateStatus.isLoading) {
    return (
      <Alert
        severity="info"
        className={`${styles.alertBar} ${styles.info}`}
        icon={<CircularProgress size={16} sx={{ color: 'inherit' }} />}
      >
        <AlertTitle>{t('infoMessages.UpdateAction')}</AlertTitle>
        <Text variant="body-large">{t('infoMessages.UpdateInfoMessage')}</Text>
      </Alert>
    );
  }
  if (response) {
    return (
      <Alert
        severity={severity}
        className={`${styles.alertBar} ${severityClass}`}
      >
        <Text variant="body-large" style={{ whiteSpace: 'pre-line' }}>
          {statusText}
        </Text>
      </Alert>
    );
  }
  return null;
}

export default AlertBar;
