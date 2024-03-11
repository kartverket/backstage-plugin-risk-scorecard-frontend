import TabList from '@material-ui/lab/TabList/TabList';
import { Tab, Typography } from '@material-ui/core';
import Box from '@mui/material/Box';
import React from 'react';

interface TabsProps {
  setTab: (tab: string) => void;
}

export const Tabs = ({ setTab }: TabsProps) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList
        onChange={(_: any, newValue: string) => setTab(newValue)}
        variant="fullWidth"
      >
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Startrisiko
            </Typography>
          }
          value="startrisiko"
        />
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Restrisiko
            </Typography>
          }
          value="restrisiko"
        />
      </TabList>
    </Box>
  );
};
