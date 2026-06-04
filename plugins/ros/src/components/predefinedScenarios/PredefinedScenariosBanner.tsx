/**
 * TEMPORARY FEATURE (planned lifetime ~2 months).
 *
 * Banner that lets a user add a set of predefined (dummy) scenarios/actions to
 * an existing RiSc. It only renders when at least one of the predefined
 * scenarios is missing from the selected RiSc, and hides itself once they are
 * all present.
 *
 * To remove this feature: delete this component, the predefinedScenarios util,
 * and the single render site in RiScPlugin.tsx.
 */
import { Button, Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { RiScWithMetadata } from '../../utils/types.ts';
import {
  buildPredefinedScenarios,
  predefinedScenarioTemplates,
} from '../../utils/predefinedScenarios.ts';
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

  const existingIds = new Set(
    selectedRiSc.content.scenarios.map(scenario => scenario.ID),
  );
  const missingTemplates = predefinedScenarioTemplates.filter(
    template => !existingIds.has(template.ID),
  );

  if (isDismissed || missingTemplates.length === 0) {
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

  return (
    <div className={styles.bannerWrapper}>
      <Flex
        className={styles.banner}
        direction="row"
        align="center"
        justify="between"
        gap="4"
      >
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
        >
          {t('predefinedScenarios.addButton')}
        </Button>
        <button type="button" className={styles.ignoreButton} onClick={dismiss}>
          {t('predefinedScenarios.ignoreButton')}
        </button>
      </Flex>
    </div>
  );
}
