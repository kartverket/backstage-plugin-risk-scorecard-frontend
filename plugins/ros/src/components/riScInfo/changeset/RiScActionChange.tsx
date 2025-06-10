import { Action } from '../../../utils/types';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';

interface RiScWholeActionChangeProps {
  action: Action;
  type: 'ADDED' | 'DELETED';
}

export function RiScActionChange({
  action,
  type,
}: RiScWholeActionChangeProps) {
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetTags>
        {type === 'ADDED' ? (
          <ChangeSetTag text="Added" type="added" />
        ) : (
          <ChangeSetTag text="Deleted" type="delete" />
        )}
        <ChangeSetTag text="Action" type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={action.title} />
      <ChangeSetProperty title="Description" value={action.description} />
      {action.url && <ChangeSetProperty title="URL" value={action.url} />}
      <ChangeSetProperty title="Status" value={action.status} />
    </ChangeSetBox>
  );
}
