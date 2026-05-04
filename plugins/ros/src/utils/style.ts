// Common styles for Input, MarkdownInput, and Markdown components
export const commonTextColor = (disabled: boolean) => {
  if (disabled) {
    return 'var(--ros-input-text-color)';
  }
  return 'inherit';
};
