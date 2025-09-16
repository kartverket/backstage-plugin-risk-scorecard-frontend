import { Box, Text } from '@backstage/ui';

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
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <img
        src={iconSrc}
        alt={altText}
        style={{ height: '24px', width: '24px' }}
      />
      <Text as="h6" style={{ fontSize: '1rem' }}>
        {text}
      </Text>
    </Box>
  );
}
