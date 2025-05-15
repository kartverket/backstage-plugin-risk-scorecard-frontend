import { Box } from '@mui/material';

export default function RiskOptionDisplay({
  isSelected,
  level,
  label,
}: {
  isSelected: boolean;
  level: number;
  label: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isSelected ? 'primary.main' : 'transparent',
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : 'primary.main',
          color: isSelected ? 'white' : 'primary.main',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {level}
      </Box>
      <span>{label}</span>
    </Box>
  );
}
