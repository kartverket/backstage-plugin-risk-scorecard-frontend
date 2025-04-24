import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        component="img"
        src={iconSrc}
        alt={altText}
        sx={{ height: 24, width: 24 }}
      />
      <Typography variant="subtitle1" mb={0}>
        {text}
      </Typography>
    </Box>
  );
}
