import {
  ScenarioRiskChange,
  SimpleTrackedProperty,
} from '../../../utils/types.ts';
import { ChangeSetBox } from './components/ChangeSetBox.tsx';
import { ChangeSetTrackedProperty } from './components/ChangeSetTrackedProperty.tsx';
import { ChangeSetBoxTitle } from './components/ChangeSetBoxTitle.tsx';
import { formatNOK } from '../../../utils/utilityfunctions.ts';

interface RiScRiskChangeSetProps {
  title: string;
  risk: SimpleTrackedProperty<ScenarioRiskChange>;
}

export function RiScRiskChangeSet({ title, risk }: RiScRiskChangeSetProps) {
  if (risk.type !== 'CONTENT_CHANGED' && risk.type !== 'UNCHANGED')
    return <></>;
  return (
    <ChangeSetBox type="secondary">
      <ChangeSetBoxTitle title={title} />
      <ChangeSetTrackedProperty
        title="Summary"
        property={risk.value.summary}
        compact={true}
        emphasised={true}
      />
      <ChangeSetTrackedProperty
        title="Consequence"
        property={risk.value.consequence}
        compact={true}
        unit="NOK / incident"
        emphasised={true}
        valueFormatter={formatNOK}
      />
      <ChangeSetTrackedProperty
        title="Probability"
        property={risk.value.probability}
        compact={true}
        unit="occurrences / year"
        emphasised={true}
      />
    </ChangeSetBox>
  );
}
