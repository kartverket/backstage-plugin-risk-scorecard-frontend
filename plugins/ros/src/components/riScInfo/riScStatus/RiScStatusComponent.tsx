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
import CheckIcon from '@mui/icons-material/Check';
import { InfoCard } from '@backstage/core-components';
import { PullRequestSvg } from '../../common/Icons';
import { useRiScs } from '../../../contexts/RiScContext';
import { subtitle1 } from '../../common/typography';
import Box from '@mui/material/Box';
import { WarningAmberOutlined } from '@mui/icons-material';
import { useAuthenticatedFetch } from '../../../utils/hooks';
import Progress from './Progress';
import { RiScMigrationDialog } from '../MigrationDialog';
import { RiScPublishDialog } from '../PublishDialog';

const emptyDifferenceFetchState: DifferenceFetchState = {
  differenceState: {
    entriesOnLeft: [],
    entriesOnRight: [],
    difference: [],
  },
  status: null,
  isLoading: false,
  errorMessage: '',
  currentDifferenceId: '',
  defaultLastModifiedDateString: '',
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
  const { fetchDifference } = useAuthenticatedFetch();

  const [publishRiScDialogIsOpen, setPublishRiScDialogIsOpen] =
    useState<boolean>(false);

  const [migrationDialogIsOpen, setMigrationDialogIsOpen] =
    useState<boolean>(false);

  const [differenceFetchState, setDifferenceFetchState] =
    useState<DifferenceFetchState>(emptyDifferenceFetchState);

  const { updateRiSc } = useRiScs();

  const handleApproveAndPublish = () => {
    publishRiScFn();
    setPublishRiScDialogIsOpen(false);
  };

  const getDifferences = () => {
    if (
      !selectedRiSc ||
      differenceFetchState.isLoading ||
      differenceFetchState.currentDifferenceId === selectedRiSc.id
    )
      return;

    setDifferenceFetchState({ ...differenceFetchState, isLoading: true });
    fetchDifference(
      selectedRiSc,
      response => {
        setDifferenceFetchState({
          differenceState: response.differenceState,
          isLoading: false,
          currentDifferenceId: selectedRiSc.id,
          status: response.status,
          errorMessage: response.errorMessage,
          defaultLastModifiedDateString: response.defaultLastModifiedDateString,
        });
      },
      () => {
        setDifferenceFetchState({
          ...emptyDifferenceFetchState,
          errorMessage: t('rosStatus.difference.error'),
          status: 'FrontendFallback', // Fallback when the backend does not deliver a response with status
        });
      },
    );
  };

  const handleUpdate = () => {
    updateRiSc(selectedRiSc.content);
    setMigrationDialogIsOpen(false);
  };

  const handleOpenPublishRiScDialog = () => {
    setPublishRiScDialogIsOpen(true);
    getDifferences();
  };

  useEffect(() => {
    setDifferenceFetchState(emptyDifferenceFetchState);
  }, [selectedRiSc]);

  const [status, setStatus] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (selectedRiSc.status === RiScStatus.Draft) {
      setStatus(1);
    } else if (selectedRiSc.status === RiScStatus.SentForApproval) {
      setStatus(2);
    } else if (selectedRiSc.status === RiScStatus.Published) {
      setStatus(3);
    }
  }, [selectedRiSc.status]);

  const migration = selectedRiSc.migrationStatus?.migrationChanges;
  // const migration = true;

  return (
    <InfoCard>
      <Typography variant="h5">Status</Typography>

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        justifyContent="space-between"
        m={1}
      >
        <Progress step={status} />

        {/* Migration */}

        {migration && (
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
              migrationVersions={
                selectedRiSc.migrationStatus?.migrationVersions
              }
            />
          </>
        )}

        {/* Draft (1) */}

        {!migration && status === 1 && (
          <>
            <Typography paragraph sx={subtitle1}>
              {t('rosStatus.statusBadge.missing')}
            </Typography>
            <Button
              color="primary"
              variant="contained"
              onClick={handleOpenPublishRiScDialog}
              sx={{ display: 'block', marginLeft: 'auto' }}
            >
              {t('rosStatus.approveButton')}
            </Button>
          </>
        )}

        {/* SentForApproval (2) */}

        {!migration && status === 2 && (
          <Typography sx={{ fontWeight: 700 }} paragraph variant="subtitle1">
            <PullRequestSvg />
            {t('rosStatus.prStatus')}
            <Link target="_blank" href={selectedRiSc.pullRequestUrl}>
              Github
            </Link>
          </Typography>
        )}

        {/* Published (3) */}

        {!migration && status === 3 && (
          <Typography paragraph sx={subtitle1}>
            <CheckIcon
              fontSize="medium"
              sx={{ transform: 'translateY(5px)' }}
            />{' '}
            {t('rosStatus.statusBadge.approved')}
          </Typography>
        )}
      </Box>

      {/* Error */}

      {!selectedRiSc && (
        <Typography paragraph sx={subtitle1}>
          {t('rosStatus.statusBadge.error')}
        </Typography>
      )}

      <RiScPublishDialog
        openDialog={publishRiScDialogIsOpen}
        handlePublish={handleApproveAndPublish}
        handleCancel={() => setPublishRiScDialogIsOpen(false)}
        differenceFetchState={differenceFetchState}
      />
    </InfoCard>
  );
};
