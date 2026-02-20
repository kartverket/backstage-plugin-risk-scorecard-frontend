import { Flex, Text } from '@backstage/ui';

export function CoverageRatio(props: { ratio: string; coverageText: string }) {
  return (
    <Flex align="center">
      <Text variant="body-large" style={{ width: '162px' }}>
        {props.coverageText}:
      </Text>
      <Text variant="title-x-small" weight="bold">
        {props.ratio}
      </Text>
    </Flex>
  );
}
