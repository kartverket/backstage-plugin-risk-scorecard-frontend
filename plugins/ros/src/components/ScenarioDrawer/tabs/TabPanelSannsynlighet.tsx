import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { Dropdown } from '../Dropdown';
import { Scenario } from '../../interface/interfaces';

interface TabPanelSannsynlighetProps {
  scenario: Scenario;
  setSannsynlighet: (event: ChangeEvent<{ value: unknown }>) => void;
  options: string[];
}

export const TabPanelSannsynlighet = ({
  scenario,
  setSannsynlighet,
  options,
}: TabPanelSannsynlighetProps) => {
  return (
    <TabPanel value="sannsynlighet">
      <Dropdown
        label="Sannsynlighet"
        selectedValues={[scenario.risiko.sannsynlighet.toString()]}
        options={options}
        handleChange={setSannsynlighet}
      />
    </TabPanel>
  );
};
