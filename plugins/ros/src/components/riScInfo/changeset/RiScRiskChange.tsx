import {
  Risk,
} from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetProperty } from './components/ChangeSetProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { formatNOK } from '../../../utils/utilityfunctions.ts';

interface RiScWholeRiskChangeProps {
  title: string;
  risk: Risk;
}

export function RiScRiskChange({ title, risk }: RiScWholeRiskChangeProps) {
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetBoxTitle title={title} />
      {risk.summary && (
        <ChangeSetProperty
          title="Summary"
          value={risk.summary}
          compact={true}
          emphasised={true}
        />
      )}
      <ChangeSetProperty
        title="Consequence"
        value={formatNOK(risk.consequence)}
        compact={true}
        unit="NOK / incident"
        emphasised={true}
      />
      <ChangeSetProperty
        title="Probability"
        value={risk.probability}
        compact={true}
        unit="occurrences / year"
        emphasised={true}
      />
    </ChangeSetBox>
  );
}
