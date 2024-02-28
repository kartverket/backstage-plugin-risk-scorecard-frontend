import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Dropdown } from '../../Dropdown';
import { tabStyles } from './style';

interface TabPanelSannsynlighetProps {
  selected: number;
  setSannsynlighet: (sannsynlighetIndex: number) => void;
  options: string[];
}

export const TabPanelSannsynlighet = ({
  selected,
  setSannsynlighet,
  options,
}: TabPanelSannsynlighetProps) => {
  const { tabPanel } = tabStyles();

  const handleChange = (value: number) => {
    setSannsynlighet(value);
  };

  return (
    <TabPanel className={tabPanel} value="sannsynlighet">
      <Dropdown<number>
        label="Sannsynlighet"
        selectedValues={selected}
        options={options}
        handleChange={handleChange}
      />
    </TabPanel>
  );
};
