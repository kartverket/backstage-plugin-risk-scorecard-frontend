import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { tabStyles } from '../style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../../style';
import { SannsynlighetTable } from './SannsynlighetTable';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface TabPanelSannsynlighetProps {
  selected: number;
  setSannsynlighet: (sannsynlighetIndex: number) => void;
  options: string[];
}

export const TabPanelSannsynlighet = ({
  selected,
  setSannsynlighet,
}: TabPanelSannsynlighetProps) => {
  const { tabPanel } = tabStyles();
  const { headerSubtitle } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const handleChange = (value: number) => {
    setSannsynlighet(value);
  };

  return (
    <TabPanel className={tabPanel} value="sannsynlighet">
      <Typography variant="h5">{t('dictionary.probability')}</Typography>
      <Typography className={headerSubtitle}>
        {t('scenarioDrawer.probabilityTab.subtitle')}
      </Typography>
      <SannsynlighetTable
        selectedValue={selected}
        handleChange={handleChange}
      />
    </TabPanel>
  );
};
