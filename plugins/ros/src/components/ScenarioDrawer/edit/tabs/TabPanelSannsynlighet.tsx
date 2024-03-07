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
      <Typography variant="h5">Sannsynlighet</Typography>
      <Typography className={headerSubtitle}>
        Hvor sannsynlig er det at dette scenarioet vil forekomme? Dersom du er
        mellom to sannsynlighetsverdier velger du den høyeste.
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
