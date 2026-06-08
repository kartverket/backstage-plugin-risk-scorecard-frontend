/**
 * TEMPORARY FEATURE (planned lifetime ~2 months).
 *
 * Self-contained approval gate for the predefined-scenarios feature. Keeps all
 * gate logic and UI out of RiScStatusComponent so the feature can be removed by
 * deleting this file and the few clearly-fenced lines in RiScStatusComponent.
 *
 * Gate rule: a Draft RiSc may not be approved until at least one predefined
 * scenario has been added (by ID) or the banner has been ignored.
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

/**
 * Wraps the approve button and, while approval is blocked, shows the
 * explanatory text as a tooltip on hover/focus. When the gate is satisfied it
 * renders its children unchanged (layout-neutral passthrough).
 *
 * The button is wrapped in a <span> because a disabled button does not emit
 * hover events; the span lets the tooltip still trigger. The span keeps the
 * right-alignment (marginLeft: auto) the button has on its own.
 */
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
