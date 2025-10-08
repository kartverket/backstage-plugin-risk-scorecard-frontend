import TabList from '@material-ui/lab/TabList/TabList';
import { Tab } from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTabsStyle } from './tabsStyle';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiskMatrixTabs } from './utils';
import { Text } from '@backstage/ui';

interface TabsProps {
  setTab: (tab: RiskMatrixTabs) => void;
}

export function Tabs({ setTab }: TabsProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const tabsStyle = useTabsStyle();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList
        onChange={(_: any, newValue: RiskMatrixTabs) => setTab(newValue)}
        variant="fullWidth"
        indicatorColor="primary"
      >
        <Tab
          label={
            <Text variant="body-large" weight="bold">
              {t('dictionary.initialRisk')}
            </Text>
          }
          value={RiskMatrixTabs.initialRisk}
          className={tabsStyle.tab}
        />
        <Tab
          label={
            <Text variant="body-large" weight="bold">
              {t('dictionary.restRisk')}
            </Text>
          }
          value={RiskMatrixTabs.remainingRisk}
          className={tabsStyle.tab}
        />
      </TabList>
    </Box>
  );
}
