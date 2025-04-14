import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@mui/material/styles';
import 'github-markdown-css/github-markdown.css';
import remarkBreaks from 'remark-breaks';

type Props = {
  description: string;
  disabled?: boolean;
};

export function Markdown({ description, disabled }: Props) {
  const theme = useTheme();

  const textColor = disabled
    ? theme.palette.mode === 'dark'
      ? '#FFFFFF80'
      : '#757575'
    : 'inherit';

  const backgroundColor = disabled
    ? theme.palette.action.disabledBackground
    : 'inherit';

  return (
    <Typography
      className="markdown-body"
      sx={{
        color: textColor,
        backgroundColor: backgroundColor,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Typography>
  );
}
