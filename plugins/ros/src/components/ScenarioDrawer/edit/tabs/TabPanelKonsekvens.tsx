import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { PickerTable } from '../../../PickerTable/PickerTable';
import { tabStyles } from './style';

interface TabPanelKonsekvensProps {
  setKonsekvens: (konsekvensIndex: number) => void;
  selected: number;
}

export const TabPanelKonsekvens = ({
  setKonsekvens,
  selected,
}: TabPanelKonsekvensProps) => {
  const { tabPanel } = tabStyles();

  return (
    <TabPanel className={tabPanel} value="konsekvens">
      <PickerTable selectedValue={selected} handleChange={setKonsekvens} />
    </TabPanel>
  );
};
