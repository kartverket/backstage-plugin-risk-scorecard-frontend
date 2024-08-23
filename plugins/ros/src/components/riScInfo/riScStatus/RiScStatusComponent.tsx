import React, { ReactComponentElement, useState } from 'react';
import {
  MigrationVersions,
  RiScStatus,
  RiScWithMetadata,
} from '../../../utils/types';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import CheckIcon from '@mui/icons-material/Check';
import FormControlLabel from '@mui/material/FormControlLabel';
import { dialogActions } from '../../common/mixins';
import { InfoCard } from '@backstage/core-components';
import { PullRequestSvg } from '../../common/Icons';
import { useRiScs } from '../../../contexts/RiScContext';
import { subtitle1 } from '../../common/typography';
import { Box } from '@material-ui/core';
import { WarningAmberOutlined } from '@mui/icons-material';

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
      <DialogActions sx={dialogActions}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePublish}
          disabled={!riskOwnerApproves}
        >
          {t('dictionary.confirm')}
        </Button>
        <Button variant="outlined" color="primary" onClick={handleCancel}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface RiScMigrationDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handleUpdate: () => void;
  migrationVersions?: MigrationVersions;
}

const RiScMigrationDialog = ({
  openDialog,
  handleCancel,
  handleUpdate,
  migrationVersions,
}: RiScMigrationDialogProps): ReactComponentElement<any> => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [saveMigration, setSaveMigration] = useState<boolean>(false);

  const handleCheckboxInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaveMigration(event.target.checked);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>{t('migrationDialog.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ marginBottom: '16px' }}>
          <Typography>
            {t('migrationDialog.description')}
            {migrationVersions?.toVersion} {t('migrationDialog.description2')}{' '}
            {migrationVersions?.fromVersion}
            {t('migrationDialog.description3')}
            <Link
              underline="always"
              target="_blank"
              href="https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md"
            >
              {t('migrationDialog.changelog')}
            </Link>{' '}
            {t('migrationDialog.description4')}
          </Typography>
        </Box>
        <Alert severity="info" icon={false}>
          <FormControlLabel
            control={
              <Checkbox
                checked={saveMigration}
                onChange={handleCheckboxInput}
              />
            }
            label={t('migrationDialog.checkboxLabel')}
          />
        </Alert>
      </DialogContent>
      <DialogActions sx={dialogActions}>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={!saveMigration}
        >
          {t('dictionary.confirm')}
        </Button>
        <Button variant="outlined" color="primary" onClick={handleCancel}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RosAcceptance = ({
  status,
  migration,
}: {
  status: RiScStatus;
  migration?: boolean;
}): React.JSX.Element => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  if (migration) {
    return (
      <>
        <Typography paragraph sx={subtitle1}>
          <WarningAmberOutlined
            fontSize="medium"
            sx={{ transform: 'translateY(5px)', marginTop: '5px' }}
          />{' '}
          {t('rosStatus.statusBadge.migration.title')}
        </Typography>
        <Typography>
          {t('rosStatus.statusBadge.migration.description')}
        </Typography>
      </>
    );
  }
  switch (status) {
    case RiScStatus.Draft:
      return (
        <Typography paragraph sx={subtitle1}>
          {t('rosStatus.statusBadge.missing')}
        </Typography>
      );
    case RiScStatus.SentForApproval:
    case RiScStatus.Published:
      return (
        <Typography paragraph sx={subtitle1}>
          <CheckIcon fontSize="medium" sx={{ transform: 'translateY(5px)' }} />{' '}
          {t('rosStatus.statusBadge.approved')}
        </Typography>
      );
    default:
      return (
        <Typography paragraph sx={subtitle1}>
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

  const [publishRiScDialogIsOpen, setPublishRiScDialogIsOpen] =
    useState<boolean>(false);

  const [migrationDialogIsOpen, setMigrationDialogIsOpen] =
    useState<boolean>(false);

  const { updateRiSc } = useRiScs();

  const handleApproveAndPublish = () => {
    publishRiScFn();
    setPublishRiScDialogIsOpen(false);
  };

  const handleUpdate = () => {
    updateRiSc(selectedRiSc.content);
    setMigrationDialogIsOpen(false);
  };

  return (
    <InfoCard>
      <Typography variant="h5">Status</Typography>

      <RosAcceptance
        status={selectedRiSc.status}
        migration={selectedRiSc.migrationStatus?.migrationChanges}
      />
      {selectedRiSc.status === RiScStatus.SentForApproval &&
        !selectedRiSc.migrationStatus?.migrationChanges && (
          <Typography sx={{ fontWeight: 700 }} paragraph variant="subtitle1">
            <PullRequestSvg />
            {t('rosStatus.prStatus')}
            <Link target="_blank" href={selectedRiSc.pullRequestUrl}>
              Github
            </Link>
          </Typography>
        )}
      {selectedRiSc.status === RiScStatus.Draft &&
        !selectedRiSc.migrationStatus?.migrationChanges && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setPublishRiScDialogIsOpen(!publishRiScDialogIsOpen)}
            disabled={selectedRiSc.status !== RiScStatus.Draft}
            sx={{ display: 'block', marginLeft: 'auto' }}
          >
            {t('rosStatus.approveButton')}
          </Button>
        )}
      {selectedRiSc.migrationStatus?.migrationChanges && (
        <>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setMigrationDialogIsOpen(!migrationDialogIsOpen)}
            sx={{ display: 'block', marginLeft: 'auto' }}
          >
            <Typography variant="button">
              {t('rosStatus.moreInformationButton')}
            </Typography>
          </Button>
          <RiScMigrationDialog
            openDialog={migrationDialogIsOpen}
            handleUpdate={handleUpdate}
            handleCancel={() => setMigrationDialogIsOpen(false)}
            migrationVersions={selectedRiSc.migrationStatus?.migrationVersions}
          />
        </>
      )}
      <RiScPublishDialog
        openDialog={publishRiScDialogIsOpen}
        handlePublish={handleApproveAndPublish}
        handleCancel={() => setPublishRiScDialogIsOpen(false)}
      />
    </InfoCard>
  );
};
