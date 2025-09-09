import ReactMarkdown from 'react-markdown';
import { useTheme } from '@mui/material/styles';
import 'github-markdown-css/github-markdown.css';
import remarkBreaks from 'remark-breaks';
import { commonTextColor, commonBackgroundColor } from '../../utils/style';
import { Text } from '@backstage/ui';

type Props = {
  description: string;
  disabled?: boolean;
};

export function Markdown({ description, disabled = false }: Props) {
  const theme = useTheme();

  return (
    <Text
      className="markdown-body"
      variant="body-large"
      style={{
        color: commonTextColor(theme, disabled),
        backgroundColor: commonBackgroundColor(theme, disabled),
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Text>
  );
}
