import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@mui/material/styles';
import 'github-markdown-css/github-markdown.css';
import remarkBreaks from 'remark-breaks';
import { commonTextColor, commonBackgroundColor } from '../../utils/style';

type Props = {
  description: string;
  disabled?: boolean;
};

export function Markdown({ description, disabled = false }: Props) {
  const theme = useTheme();

  return (
    <Typography
      className="markdown-body"
      sx={{
        color: commonTextColor(theme, disabled),
        backgroundColor: commonBackgroundColor(theme, disabled),
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Typography>
  );
}
