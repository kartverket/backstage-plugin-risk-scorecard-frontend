import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

const MarkdownEditor: React.FC = () => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="container">
      <MDEditor value={value} onChange={val => setValue(val || '')} />
      <MDEditor.Markdown source={value} />
    </div>
  );
};

export default MarkdownEditor;
