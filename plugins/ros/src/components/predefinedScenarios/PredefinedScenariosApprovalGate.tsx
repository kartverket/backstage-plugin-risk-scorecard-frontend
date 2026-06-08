/**
 * TEMPORARY FEATURE.
 *
 * Self-contained approval gate for the predefined-scenarios feature. Keeps all
 * gate logic and UI out of RiScStatusComponent so the feature can be removed by
 * deleting this file and the few clearly-fenced lines in RiScStatusComponent.
 */
import { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScWithMetadata } from '../../utils/types.ts';
import { hasAnyPredefinedScenario } from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenariosBannerDismissal } from '../../stores/PredefinedScenariosBannerStore.ts';

/** Whether approval should be blocked for the given (Draft) RiSc. */
export function usePredefinedScenariosApprovalBlocked(
  selectedRiSc: RiScWithMetadata,
): boolean {
  const { isDismissed } = usePredefinedScenariosBannerDismissal(
    selectedRiSc.id,
  );
  return !isDismissed && !hasAnyPredefinedScenario(selectedRiSc);
}

type PredefinedScenariosApprovalTooltipProps = {
  selectedRiSc: RiScWithMetadata;
  children: ReactNode;
};

export function PredefinedScenariosApprovalTooltip({
  selectedRiSc,
  children,
}: PredefinedScenariosApprovalTooltipProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const blocked = usePredefinedScenariosApprovalBlocked(selectedRiSc);

  if (!blocked) {
    return <>{children}</>;
  }

  return (
    <Tooltip title={t('rosStatus.predefinedScenariosRequired')} arrow>
      <span style={{ marginLeft: 'auto' }}>{children}</span>
    </Tooltip>
  );
}
