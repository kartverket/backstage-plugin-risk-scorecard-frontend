import { useEffect, useState } from 'react';
import {
  DifferenceFetchState,
  DifferenceStatus,
  RiScStatus,
  RiScWithMetadata,
} from '../../../utils/types';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useRiScs } from '../../../contexts/RiScContext';
import { useAuthenticatedFetch } from '../../../utils/hooks';
import { RiScMigrationDialog } from '../MigrationDialog';
import { RiScPublishDialog } from '../PublishDialog';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../../utils/utilityfunctions';
import { RiScStatusEnum, RiScStatusEnumType, StatusIconMapType } from './utils';
import { StatusIconWithText } from './StatusIconWithText';
import {
  Text,
  Button,
  Box,
  Flex,
  Card,
  CardBody,
  ButtonLink,
} from '@backstage/ui';

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
  icon: string;
  text: string;
}

function StatusBadge({ icon, text }: StatusBadgeProps) {
  return (
    <Flex direction="row" align="center" gap="2">
      <i className={icon} style={{ fontSize: '20px' }} />
      <Text as="p" variant="body-large" weight="bold">
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
    [UpdatedStatusEnum.UPDATED]: 'ri-emotion-happy-line',
    [UpdatedStatusEnum.LITTLE_OUTDATED]: 'ri-emotion-normal-line',
    [UpdatedStatusEnum.OUTDATED]: 'ri-emotion-unhappy-line',
    [UpdatedStatusEnum.VERY_OUTDATED]: 'ri-emotion-sad-line',
  };

  const statusMap: StatusIconMapType = {
    [RiScStatusEnum.CREATED]: {
      icon: 'ri-edit-line',
      text: t('rosStatus.statusBadge.created'),
    },
    [RiScStatusEnum.DRAFT]: {
      icon: 'ri-edit-line',
      text: t('rosStatus.statusBadge.draft'),
    },
    [RiScStatusEnum.WAITING]: {
      icon: 'ri-hourglass-line',
      text: t('rosStatus.statusBadge.waiting'),
    },
    [RiScStatusEnum.PUBLISHED]: {
      icon: 'ri-checkbox-circle-line',
      text: t('rosStatus.statusBadge.published'),
    },
    [RiScStatusEnum.DELETION_DRAFT]: {
      icon: 'ri-delete-bin-line',
      text: t('rosStatus.statusBadge.draftDeletion'),
    },
    [RiScStatusEnum.DELETION_WAITING]: {
      icon: 'ri-close-circle-line',
      text: t('rosStatus.statusBadge.waitingDeletion'),
    },
  };

  return (
    <Card>
      <CardBody>
        <Text variant="title-small" weight="bold" as="h5">
          Status
        </Text>

        <Flex
          direction="row"
          mt="2"
          py="2"
          px="4"
          style={{ backgroundColor: '#FCEBCD' }}
        >
          {renderStatusContent()}
        </Flex>
        {!migration && (
          <>
            <Flex
              direction="column"
              justify="between"
              align="start"
              gap="1"
              mt="4"
            >
              <StatusBadge
                icon={statusMap[status].icon}
                text={statusMap[status].text}
              />
              <Flex direction="row" mb="4" pl="7" style={{ width: '100%' }}>
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
                  <Flex
                    justify="between"
                    align="baseline"
                    style={{ width: '100%' }}
                  >
                    <Text as="p" variant="body-large">
                      {t('rosStatus.prStatus')}
                      {status === RiScStatusEnum.WAITING &&
                        t('rosStatus.prStatus2Update')}
                      {status === RiScStatusEnum.DELETION_WAITING &&
                        t('rosStatus.prStatus2Delete')}
                    </Text>
                    <ButtonLink
                      target="_blank"
                      href={selectedRiSc.pullRequestUrl}
                      variant="secondary"
                    >
                      <i className="ri-external-link-line" />
                      {t('rosStatus.githubLink')}
                    </ButtonLink>
                  </Flex>
                )}
                {status === RiScStatusEnum.PUBLISHED && (
                  <Text as="p" variant="body-large">
                    {t('rosStatus.statusBadge.approved')}
                  </Text>
                )}
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
              </Flex>
            </Flex>
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
      </CardBody>
    </Card>
  );

  function renderStatusContent() {
    if (numOfCommitsBehind !== null && daysSinceLastModified !== null) {
      return (
        <StatusIconWithText
          iconSrc={icons[updatedStatus]}
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
          iconSrc="ri-emotion-sad-line"
          altText={t('rosStatus.updatedStatus.error')}
          text={t('rosStatus.errorMessage')}
        />
      );
    }

    return (
      <StatusIconWithText
        iconSrc="ri-emotion-normal-line"
        altText={t('rosStatus.updatedStatus.disabled')}
        text={t('rosStatus.notPublishedYet')}
      />
    );
  }
}
