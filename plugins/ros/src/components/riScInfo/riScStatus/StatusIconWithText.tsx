import { Text, Flex } from '@backstage/ui';

interface StatusIconWithTextProps {
  iconSrc: string;
  altText: string;
  text: string;
}

export function StatusIconWithText({
  iconSrc,
  altText,
  text,
}: StatusIconWithTextProps) {
  return (
    <Flex direction="row" align="center" gap="2">
      <img
        src={iconSrc}
        alt={altText}
        style={{ height: '24px', width: '24px' }}
      />
      <Text as="h6" variant="body-large">
        {text}
      </Text>
    </Flex>
  );
}
