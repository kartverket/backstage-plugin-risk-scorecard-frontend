import { forwardRef, useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MDEditor from '@uiw/react-md-editor';
import { formHelperText, formLabel } from './typography';
import { TextFieldProps } from '@material-ui/core';
import { useTheme } from '@mui/material/styles';
import {
  commonTextColor,
  commonBackgroundColor,
  formControlStyles,
} from '../../utils/style';

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
      minRows,
      value,
      onMarkdownChange,
      disabled,
    },
    ref,
  ) => {
    const [markdownContent, setMarkdownContent] = useState<string | undefined>(
      value,
    );

    const theme = useTheme();

    useEffect(() => {
      setMarkdownContent(value);
    }, [value]);

    const handleMarkdownChange = (newValue: string | undefined) => {
      setMarkdownContent(newValue || '');
      onMarkdownChange?.(newValue || '');
    };

    return (
      <FormControl sx={formControlStyles} error={error}>
        {label && <FormLabel sx={formLabel}>{label}</FormLabel>}
        {sublabel && (
          <FormHelperText sx={formHelperText}>{sublabel}</FormHelperText>
        )}
        <MDEditor
          ref={ref}
          value={markdownContent}
          onChange={handleMarkdownChange}
          preview="edit"
          height={minRows ? minRows * 24 : 64}
          style={{
            color: commonTextColor(theme, disabled ?? false),
            backgroundColor: commonBackgroundColor(theme, disabled ?? false),
          }}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
