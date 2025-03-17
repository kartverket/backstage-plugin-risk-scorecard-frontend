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
import { useAuthenticatedFetch } from '../../../utils/hooks';
import Progress from './Progress';
import { RiScMigrationDialog } from '../MigrationDialog';
import { RiScPublishDialog } from '../PublishDialog';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UpdatedIcon from './icons/updated.svg';
import LittleOutdatedIcon from './icons/little_outdated.svg';
import OutdatedIcon from './icons/outdated.svg';
import VeryOutdatedIcon from './icons/very_outdated.svg';

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

interface StatusBadgeProps {
  icon: React.ElementType;
  text: string;
}

const StatusBadge = ({ icon: Icon, text }: StatusBadgeProps) => (
  <Box display="flex" gap={1} alignItems="center">
    <Icon />
    <Typography paragraph variant="subtitle1" mb={0}>
      {text}
    </Typography>
  </Box>
);

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

  const [updatedState, setUpdatedState] = useState<
    'updated' | 'little_outdated' | 'outdated' | 'very_outdated' | null
  >(null);

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
    updateRiSc(selectedRiSc);
    setMigrationDialogIsOpen(false);
  };

  const handleOpenPublishRiScDialog = () => {
    setPublishRiScDialogIsOpen(true);
    getDifferences();
  };

  useEffect(() => {
    setDifferenceFetchState(emptyDifferenceFetchState);
  }, [selectedRiSc]);

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

  const lastModifiedDate = selectedRiSc.sopsConfig.lastModified
    ? new Date(selectedRiSc.sopsConfig.lastModified).toLocaleDateString(
        'no-NO',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      )
    : null;

  const dateString = selectedRiSc.sopsConfig.lastModified;

  const calculateDaysSinceLastModified = (dateString: string) => {
    const givenDate = new Date(dateString);
    const now = new Date();

    const diffTime = now.getTime() - givenDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays.toString();
  };

  const daysSinceLastModified = dateString
    ? calculateDaysSinceLastModified(dateString)
    : null;

  const numOfCommitsBehindMain = selectedRiSc.numOfGeneralCommitsBehindMain;
  console.log('Number of commits: ' + numOfCommitsBehindMain);

  useEffect(() => {
    if (daysSinceLastModified && numOfCommitsBehindMain) {
      const days = parseInt(daysSinceLastModified);
      const commits = numOfCommitsBehindMain;

      if (commits > 50) {
        setUpdatedState('very_outdated');
      } else if (commits >= 26 && commits <= 50) {
        if (days <= 30) {
          setUpdatedState('little_outdated');
        } else if (days >= 31 && days <= 90) {
          setUpdatedState('outdated');
        } else {
          setUpdatedState('very_outdated');
        }
      } else if (commits >= 11 && commits <= 25) {
        if (days <= 30) {
          setUpdatedState('updated');
        } else if (days >= 31 && days <= 90) {
          setUpdatedState('little_outdated');
        } else if (days >= 91 && days <= 180) {
          setUpdatedState('outdated');
        } else {
          setUpdatedState('very_outdated');
        }
      } else if (commits <= 10) {
        if (days <= 60) {
          setUpdatedState('updated');
        } else {
          setUpdatedState('little_outdated');
        }
      } else {
        setUpdatedState(null);
      }
    }
  }, [daysSinceLastModified, numOfCommitsBehindMain]);

  const statusMap = {
    0: { icon: EditNoteIcon, text: t('rosStatus.statusBadge.created') },
    1: { icon: EditNoteIcon, text: t('rosStatus.statusBadge.draft') },
    2: { icon: PendingActionsIcon, text: t('rosStatus.statusBadge.waiting') },
    3: {
      icon: CheckCircleOutlineIcon,
      text: t('rosStatus.statusBadge.published'),
    },
  };

  const icons = {
    updated: UpdatedIcon,
    little_outdated: LittleOutdatedIcon,
    outdated: OutdatedIcon,
    very_outdated: VeryOutdatedIcon,
  };

  const iconSrc = updatedState ? icons[updatedState] : null;

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
            <StatusBadge
              icon={statusMap[status].icon}
              text={statusMap[status].text}
            />
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
      {lastModifiedDate && daysSinceLastModified && (
        <Box mt={2} display="flex" gap={1}>
          {iconSrc && updatedState && (
            <img
              src={iconSrc}
              alt={`${updatedState.replace('_', ' ')} Icon`}
              height={24}
              width={24}
            />
          )}
          <Typography paragraph variant="subtitle1">
            {t('rosStatus.lastModified')}
            {lastModifiedDate}{' '}
            {t('rosStatus.daysSinceLastModified', {
              days: daysSinceLastModified,
              numCommits: numOfCommitsBehindMain.toString(),
            })}
          </Typography>
        </Box>
      )}
    </InfoCard>
  );
};
