import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import remarkBreaks from 'remark-breaks';
import { Text } from '@backstage/ui';
import { useTheme } from '@mui/material/styles';

type Props = {
  description: string;
};

export function Markdown({ description }: Props) {
  const theme = useTheme();
  return (
    <Text
      variant="body-large"
      className="markdown-body"
      style={{
        color:
          theme.palette.mode === 'dark'
            ? 'var(--bui-white)'
            : 'var(--bui-black)',
      }}
    >
      {' '}
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Text>
  );
}
