/**
 * TEMPORARY FEATURE.
 *
 * Banner that lets a user add a set of predefined (dummy) scenarios/actions to
 * an existing RiSc. It only renders when at least one of the predefined
 * scenarios is missing from the selected RiSc, and hides itself once they are
 * all present.
 */

import { useState } from 'react';
import { Button, Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import {
  buildPredefinedScenarios,
  predefinedScenarioTemplates,
} from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenariosBannerDismissal } from '../../stores/PredefinedScenariosBannerStore.ts';
import { ConfirmationDialogWithoutCheckbox } from '../common/ConfirmationDialog.tsx';
import styles from './PredefinedScenariosBanner.module.css';

type PredefinedScenariosBannerProps = {
  selectedRiSc: RiScWithMetadata;
};

export function PredefinedScenariosBanner({
  selectedRiSc,
}: PredefinedScenariosBannerProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { updateRiSc, updateStatus } = useRiScs();
  const { profileInfo } = useBackstageContext();
  const { isDismissed, dismiss } = usePredefinedScenariosBannerDismissal(
    selectedRiSc.id,
  );
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);

  const existingIds = new Set(
    selectedRiSc.content.scenarios.map(scenario => scenario.ID),
  );
  const missingTemplates = predefinedScenarioTemplates.filter(
    template => !existingIds.has(template.ID),
  );

  if (
    isDismissed ||
    missingTemplates.length === 0 ||
    selectedRiSc.status === RiScStatus.DeletionDraft ||
    selectedRiSc.status === RiScStatus.DeletionSentForApproval
  ) {
    return null;
  }

  function onAdd() {
    const newScenarios = buildPredefinedScenarios(
      missingTemplates,
      profileInfo,
    );
    updateRiSc({
      ...selectedRiSc,
      content: {
        ...selectedRiSc.content,
        scenarios: [...newScenarios, ...selectedRiSc.content.scenarios],
      },
    });
  }

  function onConfirmIgnore() {
    setIsIgnoreDialogOpen(false);
    dismiss();
  }

  return (
    <>
      <Flex className={styles.banner} direction="column" align="start" gap="2">
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => setIsIgnoreDialogOpen(true)}
          aria-label={t('predefinedScenarios.ignoreButton')}
        >
          <i className="ri-close-line" />
        </button>
        <Flex direction="column" gap="1">
          <Text as="h4" variant="body-large" weight="bold">
            {t('predefinedScenarios.title')}
          </Text>
          <Text as="p" variant="body-medium">
            {t('predefinedScenarios.description')}
          </Text>
        </Flex>
        <Button
          iconStart={<i className="ri-add-line" />}
          variant="primary"
          onClick={onAdd}
          isDisabled={updateStatus.isLoading}
          style={{ marginTop: '4px' }}
        >
          {t('predefinedScenarios.addButton')}
        </Button>
      </Flex>
      <ConfirmationDialogWithoutCheckbox
        isOpen={isIgnoreDialogOpen}
        onCancel={() => setIsIgnoreDialogOpen(false)}
        onConfirm={onConfirmIgnore}
        title={t('predefinedScenarios.ignoreDialog.title')}
        confirmButtonText={t('predefinedScenarios.ignoreDialog.confirmButton')}
      >
        <Text as="p" variant="body-medium">
          {t('predefinedScenarios.ignoreDialog.description')}
        </Text>
      </ConfirmationDialogWithoutCheckbox>
    </>
  );
}
