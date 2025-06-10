import { ActionChange } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { ChangeSetChangedTitle } from './components/ChangeSetChangedTitle.tsx';

interface RiScActionChangeSetProps {
  action: ActionChange;
}

export function RiScActionChangeSet({ action }: RiScActionChangeSetProps) {
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetTags>
        <ChangeSetTag text="Action" type="primary" />
      </ChangeSetTags>
      <ChangeSetChangedTitle title={action.title} />
      <ChangeSetTrackedProperty
        title="Description"
        property={action.description}
        multiline={true}
        stringOnUndefinedProperty="No description provided"
      />
      <ChangeSetTrackedProperty
        title="URL"
        property={action.url}
        stringOnUndefinedProperty="No URL provided"
      />
      <ChangeSetTrackedProperty title="Status" property={action.status} />
    </ChangeSetBox>
  );
}
