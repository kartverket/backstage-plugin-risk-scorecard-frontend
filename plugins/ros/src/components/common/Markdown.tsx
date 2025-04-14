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

  return (
    <Typography
      className="markdown-body"
      sx={{
        color: disabled
          ? theme.palette.mode === 'dark'
            ? '#FFFFFF80'
            : '#757575'
          : 'inherit',
        backgroundColor: disabled
          ? theme.palette.action.disabledBackground
          : 'inherit',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Typography>
  );
}
