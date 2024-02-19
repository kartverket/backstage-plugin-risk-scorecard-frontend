import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { Scenario } from '../../interface/interfaces';
import { PickerTable } from '../../PickerTable/PickerTable';

interface TabPanelKonsekvensProps {
  scenario: Scenario;
  setKonsekvens: (event: ChangeEvent<{ value: unknown }>) => void;
  options: string[];
}

export const TabPanelKonsekvens = ({
  scenario,
  setKonsekvens,
}: TabPanelKonsekvensProps) => {
  return (
    <TabPanel value="konsekvens">
      <PickerTable
        selectedValue={scenario.risiko.konsekvens}
        handleChange={setKonsekvens}
      />
    </TabPanel>
  );
};
