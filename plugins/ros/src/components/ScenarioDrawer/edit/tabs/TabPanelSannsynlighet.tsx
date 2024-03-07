import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { tabStyles } from './style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../style';
import { SannsynlighetTable } from '../../../HelperTables/SannsynlighetTable';

interface TabPanelSannsynlighetProps {
  selected: number;
  setSannsynlighet: (sannsynlighetIndex: number) => void;
  options: string[];
}

export const TabPanelSannsynlighet = ({
  selected,
  setSannsynlighet,
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
        Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme
        Dersom du er mellom to sannsynlighetsverdier velger du den høyeste.
      </Typography>

      <SannsynlighetTable
        selectedValue={selected}
        handleChange={handleChange}
      />
    </TabPanel>
  );
};
