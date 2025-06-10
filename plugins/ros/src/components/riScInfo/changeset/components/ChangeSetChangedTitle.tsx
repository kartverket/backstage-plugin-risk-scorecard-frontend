import { useChangeSetStyles } from './changeSetStyles.ts';
import { SimpleTrackedProperty } from '../../../../utils/types.ts';
import { ChangeSetBoxTitle } from './ChangeSetBoxTitle.tsx';
import { ChangeSetChangedValue } from './ChangeSetChangedValue.tsx';

interface ChangeSetChangedTitleProps {
  title: SimpleTrackedProperty<string>;
}

export function ChangeSetChangedTitle({ title }: ChangeSetChangedTitleProps) {
  const styles = useChangeSetStyles();
  if (title.type === 'UNCHANGED')
    return <ChangeSetBoxTitle title={title.value} />;

  if (title.type === 'CHANGED')
    return (
      <div className={styles.boxTitle}>
        <ChangeSetChangedValue
          oldValue={title.oldValue}
          newValue={title.newValue}
        />
      </div>
    );

  return <></>;
}
