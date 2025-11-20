import { forwardRef, useState, useEffect, useRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MDEditor from '@uiw/react-md-editor';
import { formHelperText, formLabel } from '../typography';
import { TextFieldProps } from '@material-ui/core';
import classNames from 'classnames';
import { getActiveTheme } from '../../../utils/utilityfunctions';
import styles from './MarkdownInput.module.css';

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
      disabled = false,
    },
    ref,
  ) => {
    const [markdownContent, setMarkdownContent] = useState<string | undefined>(
      value,
    );

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      setMarkdownContent(value);
    }, [value]);

    useEffect(() => {
      const root = wrapperRef.current;
      if (!root) return () => {};

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const active = document.activeElement as HTMLElement | null;
        if (!active || !root.contains(active)) return;
        e.preventDefault();
        e.stopPropagation();

        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(el => !el.hasAttribute('disabled'));

        const index = focusable.indexOf(active);
        const direction = (e as KeyboardEvent & { shiftKey?: boolean }).shiftKey
          ? -1
          : 1;
        const nextIndex = index + direction;
        const next =
          focusable[nextIndex] ??
          (direction === 1 ? focusable[0] : focusable[focusable.length - 1]);
        next?.focus();
      };

      // capture phase to run before editor's own handlers and to stop propagation
      root.addEventListener('keydown', handleKeyDown, true);

      return () => {
        root.removeEventListener('keydown', handleKeyDown, true);
      };
    }, [wrapperRef]);

    const handleMarkdownChange = (newValue: string | undefined) => {
      setMarkdownContent(newValue || '');
      onMarkdownChange?.(newValue || '');
    };

    const onFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget) {
        const root = event.currentTarget as HTMLDivElement;
        const target = root.querySelector(
          'textarea, [contenteditable="true"]',
        ) as HTMLElement | null;
        if (target) {
          setTimeout(() => target.focus());
        }
      }
    };
    const editorClassName = classNames(styles.MarkDownInput, {
      [styles['MarkDownInput--disabled']]: disabled,
    });

    return (
      <FormControl className={styles.MarkDownInputFormControl} error={error}>
        {label && <FormLabel sx={formLabel}>{label}</FormLabel>}
        {sublabel && (
          <FormHelperText sx={formHelperText}>{sublabel}</FormHelperText>
        )}
        <div
          ref={wrapperRef}
          onFocusCapture={onFocusCapture}
          data-color-mode={getActiveTheme()}
          className={styles.MarkDownInputWrapper}
        >
          <MDEditor
            ref={ref}
            value={markdownContent}
            onChange={handleMarkdownChange}
            preview="edit"
            height={minRows ? minRows * 24 : 64}
            className={editorClassName}
          />
        </div>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);
