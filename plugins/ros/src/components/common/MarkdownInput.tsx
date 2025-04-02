import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import React, { forwardRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { formHelperText, formLabel } from './typography';

type Props = {
  label?: string;
  sublabel?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  minRows?: number;
  onMarkdownChange?: (markdown: string) => void;
};

export const MarkdownInput = forwardRef<HTMLDivElement, Props>(
  (
    { label, sublabel, error, helperText, required, minRows, onMarkdownChange },
    ref,
  ) => {
    const [markdownContent, setMarkdownContent] = useState<string>('');

    const handleMarkdownChange = (value: string | undefined) => {
      const updatedValue = value || '';
      setMarkdownContent(updatedValue);
      if (onMarkdownChange) {
        onMarkdownChange(updatedValue);
      }
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
        <MDEditor
          ref={ref}
          value={markdownContent}
          onChange={handleMarkdownChange}
          preview="edit"
          height={minRows ? minRows * 24 : 64}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
