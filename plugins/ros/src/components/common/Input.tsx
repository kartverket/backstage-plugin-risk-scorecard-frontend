import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import React, { forwardRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formHelperText, formLabel } from './typography';

type Props = TextFieldProps & {
  sublabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, sublabel, error, helperText, required, ...props }, ref) => {
    const [markdownContent, setMarkdownContent] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setMarkdownContent(event.target.value);
    };

    return (
      <FormControl
        sx={{ width: '100%', gap: '4px' }}
        error={error}
        required={required}
      >
        {label && (
          <FormLabel required={required} sx={formLabel}>
            {label}
          </FormLabel>
        )}
        {sublabel && (
          <FormHelperText sx={formHelperText}>{sublabel}</FormHelperText>
        )}
        <TextField
          id="filled-multiline-static"
          error={error}
          multiline
          fullWidth
          variant="outlined"
          inputRef={ref}
          InputProps={{
            sx: theme => ({
              '&.Mui-disabled': {
                color: theme.palette.mode === 'dark' ? '#FFFFFF80' : '#757575',
              },
            }),
          }}
          {...props}
          onChange={handleChange}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </FormControl>
    );
  },
);
