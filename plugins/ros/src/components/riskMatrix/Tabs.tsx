import TabList from '@material-ui/lab/TabList/TabList';
import { Tab } from '@material-ui/core';
import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiskMatrixTabs } from './utils';
import { Text } from '@backstage/ui';
import styles from './Tabs.module.css';

interface TabsProps {
  setTab: (tab: RiskMatrixTabs) => void;
}

export function Tabs({ setTab }: TabsProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList
        onChange={(_: any, newValue: RiskMatrixTabs) => setTab(newValue)}
        variant="fullWidth"
        indicatorColor="primary"
      >
        <Tab
          disableRipple
          label={
            <Text
              variant="body-large"
              weight="bold"
              className={styles.tabLabel}
            >
              {t('dictionary.initialRisk')}
            </Text>
          }
          value={RiskMatrixTabs.initialRisk}
          className={styles.tab}
        />
        <Tab
          disableRipple
          label={
            <Text
              variant="body-large"
              weight="bold"
              className={styles.tabLabel}
            >
              {t('dictionary.restRisk')}
            </Text>
          }
          value={RiskMatrixTabs.remainingRisk}
          className={styles.tab}
        />
      </TabList>
    </Box>
  );
}
