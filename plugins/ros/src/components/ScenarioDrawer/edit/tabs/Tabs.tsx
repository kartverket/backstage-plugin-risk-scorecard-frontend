import TabList from '@material-ui/lab/TabList/TabList';
import { Tab, Typography } from '@material-ui/core';
import Box from '@mui/material/Box';
import React from 'react';
import { tabStyles } from './style';

interface TabsProps {
  setTab: (tab: string) => void;
}

export const Tabs = ({ setTab }: TabsProps) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList
        onChange={(_: any, newValue: string) => setTab(newValue)}
        variant="fullWidth"
        indicatorColor="primary"
      >
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Konsekvens
            </Typography>
          }
          value="konsekvens"
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Sannsynlighet
            </Typography>
          }
          value="sannsynlighet"
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Tiltak
            </Typography>
          }
          value="tiltak"
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
      </TabList>
    </Box>
  );
};
