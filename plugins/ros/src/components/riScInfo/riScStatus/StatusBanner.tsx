import { Flex, Text } from '@backstage/ui';
import {
  DifferenceFetchState,
  DifferenceStatus,
} from '../../../utils/types.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import {
  calculateUpdatedStatus,
  UpdatedStatusEnum,
  UpdatedStatusEnumType,
} from '../../../utils/utilityfunctions.ts';
import styles from './StatusBanner.module.css';

type StatusBannerProps = {
  numOfCommitsBehind: number | null;
  daysSinceLastModified: number | null;
  differenceFetchState: DifferenceFetchState;
};

export function StatusBanner(props: StatusBannerProps) {
  const updatedStatus = calculateUpdatedStatus(
    props.daysSinceLastModified,
    props.numOfCommitsBehind,
  );

  return (
    <Flex className={styles.boxStyle}>
      <StatusIconWithText
        numOfCommitsBehind={props.numOfCommitsBehind}
        daysSinceLastModified={props.daysSinceLastModified}
        updatedStatus={updatedStatus}
        differenceFetchState={props.differenceFetchState}
      />
    </Flex>
  );
}

type StatusIconWithTextProps = {
  numOfCommitsBehind: number | null;
  daysSinceLastModified: number | null;
  updatedStatus: UpdatedStatusEnumType;
  differenceFetchState: DifferenceFetchState;
};

function StatusIconWithText(props: StatusIconWithTextProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const updatedStatusToRemixIconString: Record<UpdatedStatusEnumType, string> =
    {
      [UpdatedStatusEnum.UPDATED]: 'ri-emotion-happy-line',
      [UpdatedStatusEnum.LITTLE_OUTDATED]: 'ri-emotion-normal-line',
      [UpdatedStatusEnum.OUTDATED]: 'ri-emotion-unhappy-line',
      [UpdatedStatusEnum.VERY_OUTDATED]: 'ri-emotion-sad-line',
    };
  const updatedStatusToColor: Record<UpdatedStatusEnumType, string> = {
    [UpdatedStatusEnum.UPDATED]: 'var(--ros-risc-status-updated)',
    [UpdatedStatusEnum.LITTLE_OUTDATED]:
      'var(--ros-risc-status-little-outdated)',
    [UpdatedStatusEnum.OUTDATED]: 'var(--ros-risc-status-outdated)',
    [UpdatedStatusEnum.VERY_OUTDATED]: 'var(--ros-risc-status-very-outdated)',
  };

  if (
    props.numOfCommitsBehind !== null &&
    props.daysSinceLastModified !== null
  ) {
    return (
      <IconWithText
        remixIconClassString={
          updatedStatusToRemixIconString[props.updatedStatus]
        }
        altText={t(`rosStatus.updatedStatus.${props.updatedStatus}`)}
        text={
          t('rosStatus.lastModified') +
          t('rosStatus.daysSinceLastModified', {
            days: props.daysSinceLastModified.toString(),
            numCommits: props.numOfCommitsBehind.toString(),
          })
        }
        color={updatedStatusToColor[props.updatedStatus]}
      />
    );
  }

  if (
    props.differenceFetchState.errorMessage &&
    props.differenceFetchState.status !== DifferenceStatus.GithubFileNotFound
  ) {
    return (
      <IconWithText
        remixIconClassString="ri-emotion-sad-line"
        altText={t('rosStatus.updatedStatus.error')}
        text={t('rosStatus.errorMessage')}
        color="var(--ros-risc-status-error)"
      />
    );
  }

  return (
    <IconWithText
      remixIconClassString="ri-emotion-normal-line"
      altText={t('rosStatus.updatedStatus.disabled')}
      text={t('rosStatus.notPublishedYet')}
      color="var(--ros-risc-status-not-published)"
    />
  );
}

interface IconWithTextProps {
  remixIconClassString: string;
  altText: string;
  text: string;
  color?: string;
}

function IconWithText(props: IconWithTextProps) {
  return (
    <Flex direction="row" align="center" gap="2">
      <i
        className={props.remixIconClassString}
        aria-label={props.altText}
        style={{ fontSize: '20px', color: props.color }}
      />
      <Text as="h6" variant="body-large">
        {props.text}
      </Text>
    </Flex>
  );
}
