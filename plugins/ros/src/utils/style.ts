import { Theme } from '@mui/material/styles';

// Common styles for Input, MarkdownInput, and Markdown components
export const commonTextColor = (theme: Theme, disabled: boolean) => {
  if (disabled) {
    return theme.palette.mode === 'dark' ? '#FFFFFF80' : '#757575';
  }
  return 'inherit';
};

export const formControlStyles = {
  width: '100%',
  gap: '4px',
};
