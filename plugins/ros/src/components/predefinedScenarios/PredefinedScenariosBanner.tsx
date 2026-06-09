import { Button, Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import { buildPredefinedScenarios } from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenarios } from '../../contexts/PredefinedScenariosContext.tsx';
import { usePredefinedScenariosBannerDismissal } from '../../stores/PredefinedScenariosBannerStore.ts';
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
  const { predefinedScenarioTemplates } = usePredefinedScenarios();

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
    updateRiSc(
      {
        ...selectedRiSc,
        content: {
          ...selectedRiSc.content,
          scenarios: [...newScenarios, ...selectedRiSc.content.scenarios],
        },
      },
      dismiss,
    );
  }

  return (
    <>
      <Flex className={styles.banner} direction="column" align="start" gap="2">
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
    </>
  );
}
