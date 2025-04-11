import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';

type Props = {
  description: string;
};

export function Markdown({ description }: Props) {
  return (
    <Typography className="markdown-body">
      <ReactMarkdown>{description}</ReactMarkdown>
    </Typography>
  );
}
