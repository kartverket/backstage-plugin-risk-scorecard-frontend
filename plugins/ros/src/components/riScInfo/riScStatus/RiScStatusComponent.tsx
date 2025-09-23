import { useEffect, useState } from 'react';
import {
  DifferenceFetchState,
  DifferenceStatus,
  RiScStatus,
  RiScWithMetadata,
} from '../../../utils/types';
import Link from '@mui/material/Link';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useRiScs } from '../../../contexts/RiScContext';
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
import { Text, Button, Box, Flex, Card, CardBody } from '@backstage/ui';

const emptyDifferenceFetchState: DifferenceFetchState = {
  differenceState: {
    type: '4.*',
    migrationChanges: {
      migrationChanges: false,
      migrationRequiresNewApproval: false,
      migrationVersions: undefined,
      migrationChanges40: undefined,
      migrationChanges41: undefined,
    },
    valuations: [],
    scenarios: [],
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
    <Flex align="center" gap="2">
      <Icon />
      <Text as="p" variant="body-large">
        {text}
      </Text>
    </Flex>
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
    <Card>
      <CardBody>
        <Text variant="title-small" weight="bold" as="h5">
          Status
        </Text>
        {!migration && (
          <>
            <Box mt="2">
              <Progress step={status} />
            </Box>
            <Flex direction="row" justify="between" mt="4">
              <StatusBadge
                icon={statusMap[status].icon}
                text={statusMap[status].text}
              />

              <Flex
                direction="row"
                ml="auto"
                mb="4"
                min-width="0"
                style={{ textAlign: 'right' }}
              >
                {status === RiScStatusEnum.CREATED && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.editing')}
                  </Text>
                )}
                {status === RiScStatusEnum.DRAFT && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.statusBadge.missing')}
                  </Text>
                )}
                {status === RiScStatusEnum.DELETION_DRAFT && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.statusBadge.deletionApproval')}
                  </Text>
                )}
                {(status === RiScStatusEnum.WAITING ||
                  status === RiScStatusEnum.DELETION_WAITING) && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.prStatus')}
                    <Link target="_blank" href={selectedRiSc.pullRequestUrl}>
                      GitHub
                    </Link>
                    {status === RiScStatusEnum.WAITING &&
                      t('rosStatus.prStatus2Update')}
                    {status === RiScStatusEnum.DELETION_WAITING &&
                      t('rosStatus.prStatus2Delete')}
                  </Text>
                )}
                {status === RiScStatusEnum.PUBLISHED && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.statusBadge.approved')}
                  </Text>
                )}
              </Flex>
            </Flex>
            {(status === RiScStatusEnum.DRAFT ||
              status === RiScStatusEnum.DELETION_DRAFT) && (
              <>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleOpenPublishRiScDialog}
                  style={{
                    display: 'block',
                    marginLeft: 'auto',
                    fontSize: '14px',
                  }}
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
            <Box mt="2" mb="2">
              <Text as="p" variant="body-large" weight="bold">
                <i className="ri-error-warning-line" />{' '}
                {t('rosStatus.statusBadge.migration.title')}
              </Text>
            </Box>

            <Text as="p" variant="body-large">
              {t('rosStatus.statusBadge.migration.description')}
            </Text>

            <Flex direction="column" mt="4" align="end">
              <Button
                variant="primary"
                size="medium"
                onClick={() => setMigrationDialogIsOpen(!migrationDialogIsOpen)}
              >
                {t('rosStatus.moreInformationButton')}
              </Button>
            </Flex>
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
          <Text as="span">{t('rosStatus.statusBadge.error')}</Text>
        )}
        <Flex direction="row" mt="4">
          {renderStatusContent()}
        </Flex>
      </CardBody>
    </Card>
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
