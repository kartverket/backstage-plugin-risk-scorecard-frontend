import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { PickerTable } from './KonsekvensTable';
import { tabStyles } from '../style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../../style';

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

  return (
    <TabPanel className={tabPanel} value="konsekvens">
      <Typography variant="h5">Konsekvens</Typography>
      <Typography className={headerSubtitle}>
        Hvor alvorlig er den potensielle konsekvensen i det relevante området?
        Hvis konsekvensen er relevant for flere områder gjelder det høyeste
        konsekvensnivået.
      </Typography>
      <PickerTable selectedValue={selected} handleChange={setKonsekvens} />
    </TabPanel>
  );
};
