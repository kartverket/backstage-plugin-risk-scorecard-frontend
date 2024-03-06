import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { Dropdown } from '../../Dropdown';
import { tabStyles } from './style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../style';

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
  const { headerSubtitle } = useFontStyles();

  const handleChange = (value: number) => {
    setSannsynlighet(value);
  };

  return (
    <TabPanel className={tabPanel} value="sannsynlighet">
      <Typography variant="h5">Tiltak</Typography>
      <Typography className={headerSubtitle}>
        Hvilke tiltak kan gjøres for å unngå den uønskede hendelsen
      </Typography>
      <Dropdown<number>
        label="Sannsynlighet"
        selectedValues={selected}
        options={options}
        handleChange={handleChange}
      />
    </TabPanel>
  );
};
