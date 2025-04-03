import TabList from '@material-ui/lab/TabList/TabList';
import { Tab, Typography } from '@material-ui/core';
import Box from '@mui/material/Box';

import { useTabsStyle } from './tabsStyle';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiskMatrixTabs } from './RiskMatrix';

interface TabsProps {
  setTab: (tab: RiskMatrixTabs) => void;
}

export const Tabs = ({ setTab }: TabsProps) => {
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
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('dictionary.initialRisk')}
            </Typography>
          }
          value={RiskMatrixTabs.initialRisk}
          className={tabsStyle.tab}
        />
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('dictionary.restRisk')}
            </Typography>
          }
          value={RiskMatrixTabs.remainingRisk}
          className={tabsStyle.tab}
        />
      </TabList>
    </Box>
  );
};
