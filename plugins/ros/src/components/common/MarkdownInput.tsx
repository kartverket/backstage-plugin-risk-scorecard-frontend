import React, { forwardRef, useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MDEditor from '@uiw/react-md-editor';
import { formHelperText, formLabel } from './typography';
import { TextFieldProps } from '@material-ui/core';

type Props = TextFieldProps & {
  sublabel?: string;
  value?: string;
  onMarkdownChange?: (markdown: string) => void;
  minRows?: number;
};

export const MarkdownInput = forwardRef<HTMLDivElement, Props>(
  (
    {
      label,
      sublabel,
      error,
      helperText,
      required,
      minRows,
      value,
      onMarkdownChange,
    },
    ref,
  ) => {
    const [markdownContent, setMarkdownContent] = useState<string | undefined>(
      value,
    );

    useEffect(() => {
      setMarkdownContent(value);
    }, [value]);

    const handleMarkdownChange = (newValue: string | undefined) => {
      setMarkdownContent(newValue || '');
      if (onMarkdownChange) {
        onMarkdownChange(newValue || '');
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
