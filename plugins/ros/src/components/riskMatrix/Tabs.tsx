import TabList from '@material-ui/lab/TabList/TabList';
import { Tab, Typography } from '@material-ui/core';
import Box from '@mui/material/Box';
import React from 'react';
import { pluginTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

interface TabsProps {
  setTab: (tab: string) => void;
}

export const Tabs = ({ setTab }: TabsProps) => {
  const { t } = useTranslationRef(pluginTranslationRef);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList
        onChange={(_: any, newValue: string) => setTab(newValue)}
        variant="fullWidth"
        indicatorColor="primary"
        style={{ color: 'white' }}
      >
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('dictionary.initialRisk')}
            </Typography>
          }
          value="startrisiko"
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
        <Tab
          label={
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {t('dictionary.restRisk')}
            </Typography>
          }
          value="restrisiko"
          style={{ backgroundColor: 'transparent', color: 'white' }}
        />
      </TabList>
    </Box>
  );
};
