import TabPanel from '@material-ui/lab/TabPanel';
import React, { ChangeEvent } from 'react';
import { Dropdown } from '../Dropdown';
import { tabStyles } from './style';

interface TabPanelSannsynlighetProps {
  selected: number;
  setSannsynlighet: (event: ChangeEvent<{ value: unknown }>) => void;
  options: string[];
}

export const TabPanelSannsynlighet = ({
  selected,
  setSannsynlighet,
  options,
}: TabPanelSannsynlighetProps) => {
  const classes = tabStyles();

  return (
    <TabPanel className={classes.tabPanel} value="sannsynlighet">
      <Dropdown
        label="Sannsynlighet"
        selectedValues={[selected.toString()]}
        options={options}
        handleChange={setSannsynlighet}
      />
    </TabPanel>
  );
};
