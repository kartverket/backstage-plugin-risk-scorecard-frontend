import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { PickerTable } from '../../PickerTable/PickerTable';
import { tabStyles } from './style';

interface TabPanelKonsekvensProps {
  setKonsekvens: (event: ChangeEvent<{ value: unknown }>) => void;
  selected: number;
}

export const TabPanelKonsekvens = ({
  setKonsekvens,
  selected,
}: TabPanelKonsekvensProps) => {
  const classes = tabStyles();

  return (
    <TabPanel className={classes.tabPanel} value="konsekvens">
      <PickerTable selectedValue={selected} handleChange={setKonsekvens} />
    </TabPanel>
  );
};
