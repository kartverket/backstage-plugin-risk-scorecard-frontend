import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { ReactComponentElement, useState } from 'react';
import { RiScStatus, RiScWithMetadata } from '../../../utils/types';
import Alert from '@mui/material/Alert';
import { useRiScDialogStyles } from '../../riScDialog/riScDialogStyle';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useButtonStyles } from './riScStatusComponentStyle';
import CheckIcon from '@mui/icons-material/Check';
import FormControlLabel from '@mui/material/FormControlLabel';

interface RiScPublishDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
}

const RiScPublishDialog = ({
  openDialog,
  handleCancel,
  handlePublish,
}: RiScPublishDialogProps): ReactComponentElement<any> => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { buttons } = useRiScDialogStyles();

  const [riskOwnerApproves, setRiskOwnerApproves] = useState<boolean>(false);

  const handleCheckboxInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRiskOwnerApproves(event.target.checked);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>{t('publishDialog.title')}</DialogTitle>
      <DialogContent>
        <Alert severity="info" icon={false}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={riskOwnerApproves}
                onChange={handleCheckboxInput}
              />
            }
            label={t('publishDialog.checkboxLabel')}
          />
        </Alert>
      </DialogContent>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Box className={buttons}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            {t('dictionary.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={!riskOwnerApproves}
          >
            {t('dictionary.confirm')}
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};

function PullRequestSvg() {
  const theme = useTheme();
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        transform: 'translateY(2px)',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.55625 0.065625C9.825 0.184375 10 0.453125 10 0.75V2.25H10.5C12.5719 2.25 14.25 3.92812 14.25 6V11.1156C15.2656 11.4344 16 12.3813 16 13.5C16 14.8813 14.8813 16 13.5 16C12.1187 16 11 14.8813 11 13.5C11 12.3813 11.7344 11.4344 12.75 11.1156V6C12.75 4.75625 11.7437 3.75 10.5 3.75H10V5.25C10 5.54688 9.825 5.81562 9.55625 5.93437C9.2875 6.05312 8.96875 6.00625 8.75 5.80625L6.25 3.55625C6.09062 3.4125 6.00313 3.2125 6.00313 3C6.00313 2.7875 6.09375 2.58437 6.25 2.44375L8.75 0.19375C8.96875 -0.00312501 9.2875 -0.053125 9.55625 0.065625ZM3.5 2.5C3.5 2.23478 3.39464 1.98043 3.20711 1.79289C3.01957 1.60536 2.76522 1.5 2.5 1.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5C1.5 2.76522 1.60536 3.01957 1.79289 3.20711C1.98043 3.39464 2.23478 3.5 2.5 3.5C2.76522 3.5 3.01957 3.39464 3.20711 3.20711C3.39464 3.01957 3.5 2.76522 3.5 2.5ZM3.25 4.88438V11.1156C4.26562 11.4344 5 12.3813 5 13.5C5 14.8813 3.88125 16 2.5 16C1.11875 16 0 14.8813 0 13.5C0 12.3813 0.734375 11.4344 1.75 11.1156V4.88438C0.734375 4.56563 0 3.61875 0 2.5C0 1.11875 1.11875 0 2.5 0C3.88125 0 5 1.11875 5 2.5C5 3.61875 4.26562 4.56563 3.25 4.88438ZM3.5 13.5C3.5 13.2348 3.39464 12.9804 3.20711 12.7929C3.01957 12.6054 2.76522 12.5 2.5 12.5C2.23478 12.5 1.98043 12.6054 1.79289 12.7929C1.60536 12.9804 1.5 13.2348 1.5 13.5C1.5 13.7652 1.60536 14.0196 1.79289 14.2071C1.98043 14.3946 2.23478 14.5 2.5 14.5C2.76522 14.5 3.01957 14.3946 3.20711 14.2071C3.39464 14.0196 3.5 13.7652 3.5 13.5ZM13.5 14.5C13.7652 14.5 14.0196 14.3946 14.2071 14.2071C14.3946 14.0196 14.5 13.7652 14.5 13.5C14.5 13.2348 14.3946 12.9804 14.2071 12.7929C14.0196 12.6054 13.7652 12.5 13.5 12.5C13.2348 12.5 12.9804 12.6054 12.7929 12.7929C12.6054 12.9804 12.5 13.2348 12.5 13.5C12.5 13.7652 12.6054 14.0196 12.7929 14.2071C12.9804 14.3946 13.2348 14.5 13.5 14.5Z"
        fill={theme.palette.type === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)'}
      />
    </svg>
  );
}

const RosAcceptance = ({
  status,
}: {
  status: RiScStatus;
}): React.JSX.Element => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  switch (status) {
    case RiScStatus.Draft:
      return (
        <Typography paragraph style={{ fontWeight: 700 }} variant="subtitle1">
          {t('rosStatus.statusBadge.missing')}
        </Typography>
      );
    case RiScStatus.SentForApproval:
    case RiScStatus.Published:
      return (
        <Typography paragraph style={{ fontWeight: 700 }} variant="subtitle1">
          <CheckIcon
            fontSize="medium"
            style={{ transform: 'translateY(5px)' }}
          />{' '}
          {t('rosStatus.statusBadge.approved')}
        </Typography>
      );
    default:
      return (
        <Typography paragraph variant="subtitle1">
          {t('rosStatus.statusBadge.error')}
        </Typography>
      );
  }
};

interface RiScStatusProps {
  selectedRiSc: RiScWithMetadata;
  publishRiScFn: () => void;
}

export const RiScStatusComponent = ({
  selectedRiSc,
  publishRiScFn,
}: RiScStatusProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { approveButton } = useButtonStyles();

  const [publishRiScDialogIsOpen, setPublishRiScDialogIsOpen] =
    useState<boolean>(false);

  const handleApproveAndPublish = () => {
    publishRiScFn();
    setPublishRiScDialogIsOpen(false);
  };

  return (
    <>
      <Typography variant="h5">Status</Typography>

      <RosAcceptance status={selectedRiSc.status} />
      {selectedRiSc.status === RiScStatus.SentForApproval && (
        <Typography style={{ fontWeight: 700 }} paragraph variant="subtitle1">
          <PullRequestSvg />
          {t('rosStatus.prStatus')}
          <Link target="_blank" href={selectedRiSc.pullRequestUrl}>
            Github
          </Link>
        </Typography>
      )}

      <Grid
        item
        container
        xs
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
      >
        <Grid item>
          <Typography variant="body2" />
        </Grid>

        <Grid item>
          {selectedRiSc.status === RiScStatus.Draft && (
            <Button
              color="primary"
              variant="contained"
              onClick={() =>
                setPublishRiScDialogIsOpen(!publishRiScDialogIsOpen)
              }
              className={approveButton}
              fullWidth
              disabled={selectedRiSc.status !== RiScStatus.Draft}
            >
              <Typography variant="button">
                {t('rosStatus.approveButton')}
              </Typography>
            </Button>
          )}
        </Grid>
        <RiScPublishDialog
          openDialog={publishRiScDialogIsOpen}
          handlePublish={handleApproveAndPublish}
          handleCancel={() => setPublishRiScDialogIsOpen(false)}
        />
      </Grid>
    </>
  );
};
