import { SimpleTrackedProperty } from '../../../../utils/types.ts';
import { ChangeSetBox } from './ChangeSetBox.tsx';
import { ChangeSetBoxTitle } from './ChangeSetBoxTitle.tsx';
import { ChangeSetChangedValue } from './ChangeSetChangedValue.tsx';

interface ChangeSetSimpleBoxProps {
  prop: SimpleTrackedProperty<string> | undefined;
}

export function ChangeSetSimpleBox({ prop }: ChangeSetSimpleBoxProps) {
  return (
    <>
      {prop && prop.type === 'CHANGED' && (
        <ChangeSetBox type="primary">
          <ChangeSetBoxTitle title="Title" />
          <ChangeSetChangedValue
            oldValue={prop.oldValue}
            newValue={prop.newValue}
          />
        </ChangeSetBox>
      )}
    </>
  );
}
