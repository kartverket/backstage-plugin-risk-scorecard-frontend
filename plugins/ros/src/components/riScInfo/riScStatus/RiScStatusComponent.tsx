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
import { calculateDaysSinceLastModified } from '../../../utils/utilityfunctions';

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

  const STATUS_CREATED = 0;
  const STATUS_DRAFT = 1;
  const STATUS_WAITING = 2;
  const STATUS_PUBLISHED = 3;

  useEffect(() => {
    if (selectedRiSc.content.scenarios.length === 0) {
      setStatus(STATUS_CREATED);
    } else if (selectedRiSc.status === RiScStatus.Draft) {
      setStatus(STATUS_DRAFT);
    } else if (selectedRiSc.status === RiScStatus.SentForApproval) {
      setStatus(STATUS_WAITING);
    } else if (selectedRiSc.status === RiScStatus.Published) {
      setStatus(STATUS_PUBLISHED);
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

  const daysSinceLastModified = dateString
    ? calculateDaysSinceLastModified(dateString)
    : null;

  const numOfCommitsBehind = selectedRiSc.numOfGeneralCommitsBehind
    ? selectedRiSc.numOfGeneralCommitsBehind.toString()
    : null;

  const calculateUpdatedState = (
    daysSinceLastModified: string | null,
    numOfCommitsBehind: string | null,
  ): string => {
    if (daysSinceLastModified && numOfCommitsBehind) {
      const days = parseInt(daysSinceLastModified);
      const commits = parseInt(numOfCommitsBehind);

      if (commits > 50) {
        return 'very_outdated';
      } else if (commits >= 26 && commits <= 50) {
        if (days <= 30) {
          return 'little_outdated';
        } else if (days >= 31 && days <= 90) {
          return 'outdated';
        } else {
          return 'very_outdated';
        }
      } else if (commits >= 11 && commits <= 25) {
        if (days <= 30) {
          return 'updated';
        } else if (days >= 31 && days <= 90) {
          return 'little_outdated';
        } else if (days >= 91 && days <= 180) {
          return 'outdated';
        } else {
          return 'very_outdated';
        }
      } else if (commits <= 10) {
        if (days <= 60) {
          return 'updated';
        } else {
          return 'little_outdated';
        }
      }
    }
    return 'updated';
  };

  const updatedState = calculateUpdatedState(
    daysSinceLastModified,
    numOfCommitsBehind,
  );

  const icons = {
    updated: UpdatedIcon,
    little_outdated: LittleOutdatedIcon,
    outdated: OutdatedIcon,
    very_outdated: VeryOutdatedIcon,
  };

  const IconComponent =
    updatedState && updatedState in icons
      ? icons[updatedState as keyof typeof icons]
      : null;

  const statusMap = {
    [STATUS_CREATED]: {
      icon: EditNoteIcon,
      text: t('rosStatus.statusBadge.created'),
    },
    [STATUS_DRAFT]: {
      icon: EditNoteIcon,
      text: t('rosStatus.statusBadge.draft'),
    },
    [STATUS_WAITING]: {
      icon: PendingActionsIcon,
      text: t('rosStatus.statusBadge.waiting'),
    },
    [STATUS_PUBLISHED]: {
      icon: CheckCircleOutlineIcon,
      text: t('rosStatus.statusBadge.published'),
    },
  };

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
            {status === STATUS_CREATED && (
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

            {status === STATUS_DRAFT && (
              <Typography paragraph variant="subtitle1" ml={5} align="right">
                {t('rosStatus.statusBadge.missing')}
              </Typography>
            )}

            {status === STATUS_WAITING && (
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

            {status === STATUS_PUBLISHED && (
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

          {status === STATUS_DRAFT && (
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
          {updatedState && IconComponent && (
            <img
              src={IconComponent}
              alt={`${updatedState.replace('_', ' ')} Icon`}
              height={24}
              width={24}
            />
          )}
          <Typography paragraph variant="subtitle1">
            {t('rosStatus.lastModified')}
            {t('rosStatus.daysSinceLastModified', {
              days: daysSinceLastModified,
              numCommits: numOfCommitsBehind || '0',
            })}
          </Typography>
        </Box>
      )}
    </InfoCard>
  );
};
