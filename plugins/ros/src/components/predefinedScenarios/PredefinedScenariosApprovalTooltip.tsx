import { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { hasAnyPredefinedScenario } from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenariosFeatureFlag } from '../../utils/featureFlags';
import { usePredefinedScenarios } from '../../hooks/usePredefinedScenarios.ts';

type PredefinedScenariosApprovalTooltipProps = {
  selectedRiSc: RiScWithMetadata;
  isDismissed: boolean;
  children: (isDisabled: boolean) => ReactNode;
};

export function PredefinedScenariosApprovalTooltip({
  selectedRiSc,
  isDismissed,
  children,
}: PredefinedScenariosApprovalTooltipProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const isTestPredefinedScenariosEnabled = usePredefinedScenariosFeatureFlag();
  const { data: predefinedScenarios } = usePredefinedScenarios(
    isTestPredefinedScenariosEnabled,
  );

  if (
    selectedRiSc.status === RiScStatus.DeletionSentForApproval ||
    selectedRiSc.status === RiScStatus.DeletionDraft
  ) {
    return children(false);
  }

  if (!predefinedScenarios) {
    // This works while fetching the scenarios, or if it has failed, in neither case
    // which you should be able to move on since we use the time of approval as an
    // indication of these having been addressed. The error will be shown in the banner.
    return (
      <Tooltip title={t('rosStatus.predefinedScenariosRequired')} arrow>
        <span style={{ marginLeft: 'auto' }}>{children(true)}</span>
      </Tooltip>
    );
  }

  const blocked =
    predefinedScenarios.length > 0 &&
    !isDismissed &&
    !hasAnyPredefinedScenario(selectedRiSc, predefinedScenarios);

  if (!blocked) {
    return children(false);
  }

  return (
    <Tooltip title={t('rosStatus.predefinedScenariosRequired')} arrow>
      <span style={{ marginLeft: 'auto' }}>{children(true)}</span>
    </Tooltip>
  );
}
