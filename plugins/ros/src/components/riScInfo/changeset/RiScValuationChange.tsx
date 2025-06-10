import { SimpleTrackedProperty, Valuations } from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTag } from './components/ChangeSetTag.tsx';
import { ChangeSetTags } from './components/ChangeSetTags.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';

interface RiScWholeValuationChangeProps {
  valuation: SimpleTrackedProperty<Valuations>;
}

export function RiScValuationChange({
  valuation,
}: RiScWholeValuationChangeProps) {
  if (valuation.type !== 'ADDED' && valuation.type !== 'DELETED') return <></>;
  const valuationContent =
    valuation.type === 'ADDED' ? valuation.newValue : valuation.oldValue;
  return (
    <ChangeSetBox type="primary">
      <ChangeSetTags>
        {valuation.type === 'ADDED' && (
          <ChangeSetTag text="Added" type="added" />
        )}
        {valuation.type === 'DELETED' && (
          <ChangeSetTag text="Deleted" type="delete" />
        )}
        <ChangeSetTag text="Valuation" type="primary" />
      </ChangeSetTags>
      <ChangeSetBoxTitle title={valuationContent.description}/>
      <ChangeSetProperty
        title="Confidentiality"
        value={valuationContent.confidentiality}
        emphasised={true}
      />
      <ChangeSetProperty
        title="Availability"
        value={valuationContent.availability}
        emphasised={true}
      />
      <ChangeSetProperty
        title="Integrity"
        value={valuationContent.integrity}
        emphasised={true}
      />
    </ChangeSetBox>
  );
}
