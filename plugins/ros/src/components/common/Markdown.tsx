import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import remarkBreaks from 'remark-breaks';
import { Text } from '@backstage/ui';

type Props = {
  description: string;
};

export function Markdown({ description }: Props) {
  return (
    <Text variant="body-large" className="markdown-body">
      {' '}
      <ReactMarkdown remarkPlugins={[remarkBreaks]}>
        {description}
      </ReactMarkdown>
    </Text>
  );
}
