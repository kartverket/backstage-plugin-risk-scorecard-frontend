import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { Dropdown } from '../Dropdown';

interface TabPanelKonsekvensProps {
  selected: number;
  setKonsekvens: (event: ChangeEvent<{ value: unknown }>) => void;
  options: string[];
}

export const TabPanelKonsekvens = ({
  selected,
  setKonsekvens,
  options,
}: TabPanelKonsekvensProps) => {
  return (
    <TabPanel value="konsekvens">
      <Dropdown
        label="Konsekvens"
        selectedValues={[selected.toString()]}
        options={options}
        handleChange={setKonsekvens}
      />
    </TabPanel>
  );
};
