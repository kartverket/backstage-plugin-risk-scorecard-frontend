import { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { hasAnyPredefinedScenario } from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenariosFeatureFlag } from '../../utils/featureFlags';
import { usePredefinedScenariosBannerDismissal } from '../../stores/PredefinedScenariosBannerStore.ts';
import { usePredefinedScenarios } from '../../hooks/usePredefinedScenarios.ts';

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
  const isTestPredefinedScenariosEnabled = usePredefinedScenariosFeatureFlag();
  const { data: predefinedScenarios } = usePredefinedScenarios(
    isTestPredefinedScenariosEnabled,
  );

  if (!predefinedScenarios) {
    return (
      <Tooltip title={t('rosStatus.predefinedScenariosRequired')} arrow>
        <span style={{ marginLeft: 'auto' }}>{children(true)}</span>
      </Tooltip>
    );
  }

  const blocked =
    predefinedScenarios.length > 0 &&
    !isDismissed &&
    !hasAnyPredefinedScenario(
      selectedRiSc,
      predefinedScenarios.map(s => s.scenario.ID),
    );

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
