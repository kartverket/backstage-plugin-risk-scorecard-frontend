import { useEffect, useState } from 'react';
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
import DisabledIcon from './icons/disabled.svg';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../../utils/utilityfunctions';
import { RiScStatusEnum, RiScStatusEnumType, StatusIconMapType } from './utils';

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

function StatusBadge({ icon: Icon, text }: StatusBadgeProps) {
  return (
    <Box display="flex" gap={1} alignItems="center">
      <Icon />
      <Typography paragraph variant="subtitle1" mb={0}>
        {text}
      </Typography>
    </Box>
  );
}

export function RiScStatusComponent({
  selectedRiSc,
  publishRiScFn,
}: RiScStatusProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { fetchDifference } = useAuthenticatedFetch();

  const [publishRiScDialogIsOpen, setPublishRiScDialogIsOpen] =
    useState<boolean>(false);

  const [migrationDialogIsOpen, setMigrationDialogIsOpen] =
    useState<boolean>(false);

  const [differenceFetchState, setDifferenceFetchState] =
    useState<DifferenceFetchState>(emptyDifferenceFetchState);

  const { updateRiSc } = useRiScs();

  function handleApproveAndPublish() {
    publishRiScFn();
    setPublishRiScDialogIsOpen(false);
  }

  function getDifferences() {
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
  }

  function handleUpdate() {
    updateRiSc(selectedRiSc);
    setMigrationDialogIsOpen(false);
  }

  function handleOpenPublishRiScDialog() {
    setPublishRiScDialogIsOpen(true);
    getDifferences();
  }

  useEffect(() => {
    setDifferenceFetchState(emptyDifferenceFetchState);
  }, [selectedRiSc]);

  const [status, setStatus] = useState<RiScStatusEnumType>(
    RiScStatusEnum.CREATED,
  );

  useEffect(() => {
    if (selectedRiSc.content.scenarios.length === 0) {
      setStatus(RiScStatusEnum.CREATED);
    } else if (selectedRiSc.status === RiScStatus.Draft) {
      setStatus(RiScStatusEnum.DRAFT);
    } else if (selectedRiSc.status === RiScStatus.SentForApproval) {
      setStatus(RiScStatusEnum.WAITING);
    } else if (selectedRiSc.status === RiScStatus.Published) {
      setStatus(RiScStatusEnum.PUBLISHED);
    }
  }, [selectedRiSc.status, selectedRiSc.content.scenarios]);

  const migration = selectedRiSc.migrationStatus?.migrationChanges;

  const lastPublishedDateTime = selectedRiSc.lastPublished?.dateTime;
  const lastPublishedNumberOfCommits =
    selectedRiSc.lastPublished?.numberOfCommits;

  const daysSinceLastModified = lastPublishedDateTime
    ? calculateDaysSince(new Date(lastPublishedDateTime))
    : null;

  const numOfCommitsBehind = lastPublishedNumberOfCommits ?? null;

  const updatedStatus = calculateUpdatedStatus(
    daysSinceLastModified,
    numOfCommitsBehind,
  );

  const icons: Record<UpdatedStatusEnumType, string> = {
    [UpdatedStatusEnum.UPDATED]: UpdatedIcon,
    [UpdatedStatusEnum.LITTLE_OUTDATED]: LittleOutdatedIcon,
    [UpdatedStatusEnum.OUTDATED]: OutdatedIcon,
    [UpdatedStatusEnum.VERY_OUTDATED]: VeryOutdatedIcon,
  };

  const statusMap: StatusIconMapType = {
    [RiScStatusEnum.CREATED]: {
      icon: EditNoteIcon,
      text: t('rosStatus.statusBadge.created'),
    },
    [RiScStatusEnum.DRAFT]: {
      icon: EditNoteIcon,
      text: t('rosStatus.statusBadge.draft'),
    },
    [RiScStatusEnum.WAITING]: {
      icon: PendingActionsIcon,
      text: t('rosStatus.statusBadge.waiting'),
    },
    [RiScStatusEnum.PUBLISHED]: {
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
            {status === RiScStatusEnum.CREATED && (
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
            {status === RiScStatusEnum.DRAFT && (
              <Typography paragraph variant="subtitle1" ml={5} align="right">
                {t('rosStatus.statusBadge.missing')}
              </Typography>
            )}
            {status === RiScStatusEnum.WAITING && (
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
            {status === RiScStatusEnum.PUBLISHED && (
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
          {status === RiScStatusEnum.DRAFT && (
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
      <Box mt={2} display="flex" gap={1}>
        {numOfCommitsBehind !== null && daysSinceLastModified !== null ? (
          <>
            <Box
              component="img"
              src={icons[updatedStatus] as string}
              alt="Updated Status Icon"
              sx={{ height: 24, width: 24 }}
            />
            <Typography paragraph variant="subtitle1">
              {t('rosStatus.lastModified')}
              {t('rosStatus.daysSinceLastModified', {
                days: daysSinceLastModified.toString(),
                numCommits: numOfCommitsBehind.toString(),
              })}
            </Typography>
          </>
        ) : differenceFetchState.errorMessage ? (
          <>
            <Box
              component="img"
              src={icons[UpdatedStatusEnum.VERY_OUTDATED] as string}
              alt="Error Status Icon"
              sx={{ height: 24, width: 24 }}
            />
            <Typography paragraph variant="subtitle1">
              {t('rosStatus.errorMessage')}
            </Typography>
          </>
        ) : (
          <>
            <Box
              component="img"
              src={DisabledIcon as string}
              alt="Disabled Status Icon"
              sx={{ height: 24, width: 24 }}
            />
            <Typography paragraph variant="subtitle1">
              {t('rosStatus.notPublishedYet')}
            </Typography>
          </>
        )}
      </Box>
    </InfoCard>
  );
}
