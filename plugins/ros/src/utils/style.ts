import { Theme } from '@mui/material/styles';

// Common styles for Input, MarkdownInput, and Markdown components
export const commonTextColor = (theme: Theme, disabled: boolean) => {
  if (disabled) {
    return theme.palette.mode === 'dark' ? '#FFFFFF80' : '#757575';
  }
  return 'inherit';
};
