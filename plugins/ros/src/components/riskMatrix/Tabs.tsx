import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiskMatrixTabs } from './utils';
import { Text, Button, Flex } from '@backstage/ui';
import styles from './Tabs.module.css';

interface MatrixTabsProps {
  setTab: (tab: RiskMatrixTabs) => void;
  currentTab: RiskMatrixTabs;
}

export function MatrixTabs({ setTab, currentTab }: MatrixTabsProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex pt="12px">
      <Button
        variant={
          currentTab === RiskMatrixTabs.initialRisk ? 'primary' : 'secondary'
        }
        onClick={() => setTab(RiskMatrixTabs.initialRisk)}
        aria-label="Initial risk"
        className={styles.riskMatrixButton}
      >
        <Text
          variant="body-large"
          weight="bold"
          className={styles.tabButtonTextBase}
          data-selected={currentTab === RiskMatrixTabs.initialRisk}
        >
          {t('dictionary.initialRisk')}
        </Text>
      </Button>
      <Button
        variant={
          currentTab === RiskMatrixTabs.remainingRisk ? 'primary' : 'secondary'
        }
        onClick={() => setTab(RiskMatrixTabs.remainingRisk)}
        aria-label="Remaining risk"
        className={styles.riskMatrixButton}
      >
        <Text
          variant="body-large"
          weight="bold"
          className={styles.tabButtonTextBase}
          data-selected={currentTab === RiskMatrixTabs.remainingRisk}
        >
          {t('dictionary.restRisk')}
        </Text>
      </Button>
    </Flex>
  );
}
