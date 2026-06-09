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
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { hasAnyPredefinedScenario } from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenarios } from '../../contexts/PredefinedScenariosContext.tsx';
import { usePredefinedScenariosBannerDismissal } from '../../stores/PredefinedScenariosBannerStore.ts';

type PredefinedScenariosApprovalTooltipProps = {
  selectedRiSc: RiScWithMetadata;
  children: (isDisabled: boolean) => ReactNode;
};

export function PredefinedScenariosApprovalTooltip({
  selectedRiSc,
  children,
}: PredefinedScenariosApprovalTooltipProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { isDismissed } = usePredefinedScenariosBannerDismissal(
    selectedRiSc.id,
  );
  const { predefinedScenarioIds } = usePredefinedScenarios();
  const blocked =
    predefinedScenarioIds.length > 0 &&
    !isDismissed &&
    !hasAnyPredefinedScenario(selectedRiSc, predefinedScenarioIds);

  if (
    !blocked ||
    selectedRiSc.status === RiScStatus.DeletionSentForApproval ||
    selectedRiSc.status === RiScStatus.DeletionDraft
  ) {
    return children(false);
  }

  return (
    <Tooltip title={t('rosStatus.predefinedScenariosRequired')} arrow>
      <span style={{ marginLeft: 'auto' }}>{children(true)}</span>
    </Tooltip>
  );
}
