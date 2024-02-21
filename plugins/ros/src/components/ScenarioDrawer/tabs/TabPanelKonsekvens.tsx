import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { PickerTable } from '../../PickerTable/PickerTable';

interface TabPanelKonsekvensProps {
  setKonsekvens: (event: ChangeEvent<{ value: unknown }>) => void;
  selected: number;
}

export const TabPanelKonsekvens = ({
  setKonsekvens,
  selected,
}: TabPanelKonsekvensProps) => {
  return (
    <TabPanel value="konsekvens">
      <PickerTable selectedValue={selected} handleChange={setKonsekvens} />
    </TabPanel>
  );
};
