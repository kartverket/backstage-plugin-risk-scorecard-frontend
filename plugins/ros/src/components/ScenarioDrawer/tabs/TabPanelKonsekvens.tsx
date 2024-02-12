import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { Dropdown } from '../Dropdown';
import { Scenario } from '../../interface/interfaces';

interface TabPanelKonsekvensProps {
  scenario: Scenario;
  setKonsekvens: (event: ChangeEvent<{ value: unknown }>) => void;
  options: string[];
}

export const TabPanelKonsekvens = ({
  scenario,
  setKonsekvens,
  options,
}: TabPanelKonsekvensProps) => {
  return (
    <TabPanel value="konsekvens">
      <Dropdown
        label="Konsekvens"
        selectedValues={[scenario.risiko.konsekvens.toString()]}
        options={options}
        handleChange={setKonsekvens}
      />
    </TabPanel>
  );
};
