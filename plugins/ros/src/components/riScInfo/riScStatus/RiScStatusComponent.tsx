import { useEffect, useState } from 'react';
import {
  DifferenceFetchState,
  DifferenceStatus,
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
import { StatusIconWithText } from './StatusIconWithText';
import DeleteIcon from '@mui/icons-material/Delete';

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
          status: DifferenceStatus.FrontendFallback, // Fallback when the backend does not deliver a response with status
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

  function handleClosePublishRiScDialog() {
    setPublishRiScDialogIsOpen(false);
  }

  useEffect(() => {
    setDifferenceFetchState(emptyDifferenceFetchState);
  }, [selectedRiSc]);

  const [status, setStatus] = useState<RiScStatusEnumType>(
    RiScStatusEnum.CREATED,
  );

  useEffect(() => {
    if (selectedRiSc.status === RiScStatus.DeletionDraft) {
      setStatus(RiScStatusEnum.DELETION_DRAFT);
    } else if (selectedRiSc.status === RiScStatus.DeletionSentForApproval) {
      setStatus(RiScStatusEnum.DELETION_WAITING);
    } else if (selectedRiSc.content.scenarios.length === 0) {
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
    [RiScStatusEnum.DELETION_DRAFT]: {
      icon: DeleteIcon,
      text: t('rosStatus.statusBadge.draftDeletion'),
    },
    [RiScStatusEnum.DELETION_WAITING]: {
      icon: DeleteIcon,
      text: t('rosStatus.statusBadge.waitingDeletion'),
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
            {status === RiScStatusEnum.DELETION_DRAFT && (
              <Typography paragraph variant="subtitle1" ml={5} align="right">
                {t('rosStatus.statusBadge.deletionApproval')}
              </Typography>
            )}
            {(status === RiScStatusEnum.WAITING ||
              status === RiScStatusEnum.DELETION_WAITING) && (
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
                {status === RiScStatusEnum.WAITING &&
                  t('rosStatus.prStatus2Update')}
                {status === RiScStatusEnum.DELETION_WAITING &&
                  t('rosStatus.prStatus2Delete')}
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
          {(status === RiScStatusEnum.DRAFT ||
            status === RiScStatusEnum.DELETION_DRAFT) && (
            <>
              <Button
                color="primary"
                variant="contained"
                onClick={handleOpenPublishRiScDialog}
                sx={{ display: 'block', marginLeft: 'auto' }}
              >
                {status === RiScStatusEnum.DRAFT &&
                  t('rosStatus.approveButtonUpdate')}
                {status === RiScStatusEnum.DELETION_DRAFT &&
                  t('rosStatus.approveButtonDelete')}
              </Button>
              <RiScPublishDialog
                openDialog={publishRiScDialogIsOpen}
                isDeletion={status === RiScStatusEnum.DELETION_DRAFT}
                handlePublish={handleApproveAndPublish}
                handleCancel={handleClosePublishRiScDialog}
                differenceFetchState={differenceFetchState}
              />
            </>
          )}
        </>
      )}
      {/* Need to include the undefined check here, as TypeScript does not pick up that this check is part of `migration` */}
      {migration && selectedRiSc.migrationStatus && (
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
            migrationStatus={selectedRiSc.migrationStatus}
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
        {renderStatusContent()}
      </Box>
    </InfoCard>
  );

  function renderStatusContent() {
    if (numOfCommitsBehind !== null && daysSinceLastModified !== null) {
      return (
        <StatusIconWithText
          iconSrc={icons[updatedStatus] as string}
          altText={t(`rosStatus.updatedStatus.${updatedStatus}`)}
          text={
            t('rosStatus.lastModified') +
            t('rosStatus.daysSinceLastModified', {
              days: daysSinceLastModified.toString(),
              numCommits: numOfCommitsBehind.toString(),
            })
          }
        />
      );
    }

    if (
      differenceFetchState.errorMessage &&
      differenceFetchState.status !== DifferenceStatus.GithubFileNotFound
    ) {
      return (
        <StatusIconWithText
          iconSrc={VeryOutdatedIcon as string}
          altText={t('rosStatus.updatedStatus.error')}
          text={t('rosStatus.errorMessage')}
        />
      );
    }

    return (
      <StatusIconWithText
        iconSrc={DisabledIcon as string}
        altText={t('rosStatus.updatedStatus.disabled')}
        text={t('rosStatus.notPublishedYet')}
      />
    );
  }
}
