import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { ConsequenceTable } from './KonsekvensTable';
import { tabStyles } from '../style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../../style';
import { pluginRiScTranslationRef } from '../../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface TabPanelKonsekvensProps {
  setKonsekvens: (konsekvensIndex: number) => void;
  selected: number;
}

export const TabPanelKonsekvens = ({
  setKonsekvens,
  selected,
}: TabPanelKonsekvensProps) => {
  const { tabPanel } = tabStyles();
  const { headerSubtitle } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <TabPanel className={tabPanel} value="konsekvens">
      <Typography variant="h5">{t('dictionary.consequence')}</Typography>
      <Typography className={headerSubtitle}>
        {t('scenarioDrawer.consequenceTab.subtitle')}
      </Typography>
      <ConsequenceTable selectedValue={selected} handleChange={setKonsekvens} />
    </TabPanel>
  );
};
