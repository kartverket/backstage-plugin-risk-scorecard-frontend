import { Button, Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import { RiScStatus, RiScWithMetadata } from '../../utils/types.ts';
import {
  buildPredefinedScenarios,
  hasAnyPredefinedScenario,
} from '../../utils/predefinedScenarios.ts';
import { usePredefinedScenarios } from '../../hooks/usePredefinedScenarios.ts';
import styles from './PredefinedScenariosBanner.module.css';
import CircularProgress from '@mui/material/CircularProgress';
import { usePredefinedScenariosFeatureFlag } from '../../utils/featureFlags.ts';

type PredefinedScenariosBannerProps = {
  selectedRiSc: RiScWithMetadata;
  isDismissed: boolean;
  dismiss: () => void;
};

export function PredefinedScenariosBanner({
  selectedRiSc,
  isDismissed,
  dismiss,
}: PredefinedScenariosBannerProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { updateRiSc, updateStatus } = useRiScs();
  const { profileInfo } = useBackstageContext();
  const isTestPredefinedScenariosEnabled = usePredefinedScenariosFeatureFlag();
  const {
    data: predefinedScenarios,
    isError,
    isPending,
  } = usePredefinedScenarios(isTestPredefinedScenariosEnabled);
  if (
    isDismissed ||
    selectedRiSc.status === RiScStatus.DeletionDraft ||
    selectedRiSc.status === RiScStatus.DeletionSentForApproval
  ) {
    return null;
  }

  if (isPending) {
    return (
      <Flex justify="center">
        <CircularProgress />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex className={styles.error} direction="column" align="start" gap="1">
        <Text as="p" variant="body-medium">
          {t('predefinedScenarios.error')}
        </Text>
      </Flex>
    );
  }

  if (
    predefinedScenarios.length === 0 ||
    hasAnyPredefinedScenario(selectedRiSc, predefinedScenarios)
  ) {
    return null;
  }
  const newScenarios = buildPredefinedScenarios(
    predefinedScenarios,
    profileInfo,
  );

  function onAdd() {
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
