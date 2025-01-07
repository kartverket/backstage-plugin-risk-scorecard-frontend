import React, { useEffect, useState } from 'react';
import {
  DifferenceFetchState,
  RiScStatus,
  RiScWithMetadata,
} from '../../../utils/types';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { InfoCard } from '@backstage/core-components';
import { useRiScs } from '../../../contexts/RiScContext';
import { subtitle1 } from '../../common/typography';
import Box from '@mui/material/Box';
import { WarningAmberOutlined } from '@mui/icons-material';
import Progress from './Progress';
import { RiScMigrationDialog } from '../MigrationDialog';
import { RiScPublishDialog } from '../PublishDialog';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface RiScStatusProps {
  selectedRiSc: RiScWithMetadata;
  publishRiScFn: () => void;
  differenceFetchState: DifferenceFetchState;
  setDifferenceFetchState: React.Dispatch<
    React.SetStateAction<DifferenceFetchState>
  >;
  emptyDifferenceFetchState: DifferenceFetchState;
}

export const RiScStatusComponent = ({
  selectedRiSc,
  publishRiScFn,
  differenceFetchState,
  setDifferenceFetchState,
  emptyDifferenceFetchState,
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

  const handleOpenPublishRiScDialog = () => {
    setPublishRiScDialogIsOpen(true);
  };

  useEffect(() => {
    setDifferenceFetchState(emptyDifferenceFetchState);
  }, [emptyDifferenceFetchState, selectedRiSc, setDifferenceFetchState]);

  const [status, setStatus] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (selectedRiSc.content.scenarios.length === 0) {
      setStatus(0);
    } else if (selectedRiSc.status === RiScStatus.Draft) {
      setStatus(1);
    } else if (selectedRiSc.status === RiScStatus.SentForApproval) {
      setStatus(2);
    } else if (selectedRiSc.status === RiScStatus.Published) {
      setStatus(3);
    }
  }, [selectedRiSc.status, selectedRiSc.content.scenarios]);

  const migration = selectedRiSc.migrationStatus?.migrationChanges;

  return (
    <InfoCard>
      <Typography variant="h5">Status</Typography>

      {!migration && (
        <>
          <Box mt={1}>
            <Progress step={status} />
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            mt={2}
          >
            {status === 0 && (
              <Box display="flex" gap={1}>
                <EditNoteIcon />
                <Typography paragraph variant="subtitle1" mb={0}>
                  {t('rosStatus.statusBadge.created')}
                </Typography>
              </Box>
            )}
            {status === 1 && (
              <Box display="flex" gap={1}>
                <EditNoteIcon />
                <Typography paragraph variant="subtitle1" mb={0}>
                  {t('rosStatus.statusBadge.draft')}
                </Typography>
              </Box>
            )}
            {status === 2 && (
              <Box display="flex" gap={1}>
                <PendingActionsIcon />
                <Typography paragraph variant="subtitle1" mb={0}>
                  {t('rosStatus.statusBadge.waiting')}
                </Typography>
              </Box>
            )}
            {status === 3 && (
              <Box display="flex" gap={1}>
                <CheckCircleOutlineIcon />
                <Typography paragraph variant="subtitle1" mb={0}>
                  {t('rosStatus.statusBadge.published')}
                </Typography>
              </Box>
            )}

            {/* Created */}
            {status === 0 && (
              <Typography
                paragraph
                variant="subtitle1"
                mb={0}
                ml={5}
                align="right"
              >
                {t('rosStatus.editing')}
              </Typography>
            )}

            {/* Draft */}
            {status === 1 && (
              <Typography paragraph variant="subtitle1" ml={5} align="right">
                {t('rosStatus.statusBadge.missing')}
              </Typography>
            )}

            {/* Waiting for approval */}
            {status === 2 && (
              <Typography
                paragraph
                variant="subtitle1"
                mb={0}
                ml={5}
                align="right"
              >
                {t('rosStatus.prStatus')}
                <Link target="_blank" href={selectedRiSc.pullRequestUrl}>
                  Github
                </Link>
                {t('rosStatus.prStatus2')}
              </Typography>
            )}

            {/* Published */}
            {status === 3 && (
              <Typography
                paragraph
                variant="subtitle1"
                display="flex"
                gap={1}
                mb={0}
              >
                {t('rosStatus.statusBadge.approved')}
              </Typography>
            )}
          </Box>

          {/* Draft */}
          {status === 1 && (
            <>
              <Button
                color="primary"
                variant="contained"
                onClick={handleOpenPublishRiScDialog}
                sx={{ display: 'block', marginLeft: 'auto' }}
              >
                {t('rosStatus.approveButton')}
              </Button>
              <RiScPublishDialog
                openDialog={publishRiScDialogIsOpen}
                handlePublish={handleApproveAndPublish}
                handleCancel={() => setPublishRiScDialogIsOpen(false)}
                differenceFetchState={differenceFetchState}
              />
            </>
          )}
        </>
      )}

      {/* Migration */}
      {migration && (
        <Box>
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
          <Button
            color="primary"
            variant="contained"
            onClick={() => setMigrationDialogIsOpen(!migrationDialogIsOpen)}
            sx={{ display: 'block', marginLeft: 'auto', mt: 1 }}
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
        </Box>
      )}

      {/* Error */}
      {!selectedRiSc && (
        <Typography paragraph variant="subtitle1">
          {t('rosStatus.statusBadge.error')}
        </Typography>
      )}
    </InfoCard>
  );
};
