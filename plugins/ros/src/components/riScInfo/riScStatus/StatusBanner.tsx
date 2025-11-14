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
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  return (
    <Flex
      direction="row"
      mt="2"
      py="2"
      px="4"
      style={{
        backgroundColor:
          theme.palette.mode === 'dark' ? 'var(--bui-gray-5)' : '#FCEBCD',
      }}
    >
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
      />
    );
  }

  return (
    <IconWithText
      remixIconClassString="ri-emotion-normal-line"
      altText={t('rosStatus.updatedStatus.disabled')}
      text={t('rosStatus.notPublishedYet')}
    />
  );
}

interface IconWithTextProps {
  remixIconClassString: string;
  altText: string;
  text: string;
}

function IconWithText(props: IconWithTextProps) {
  return (
    <Flex direction="row" align="center" gap="2">
      <i
        className={props.remixIconClassString}
        aria-label={props.altText}
        style={{ fontSize: '20px' }}
      />
      <Text as="h6" variant="body-large">
        {props.text}
      </Text>
    </Flex>
  );
}
