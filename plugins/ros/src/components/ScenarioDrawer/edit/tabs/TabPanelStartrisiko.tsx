import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';
import { KonsekvensTable } from '../../../HelperTables/KonsekvensTable';
import { tabStyles } from './style';
import { Typography } from '@material-ui/core';
import { useFontStyles } from '../../style';
import { SannsynlighetTable } from '../../../HelperTables/SannsynlighetTable';

interface TabPanelStartrisikoProps {
  setKonsekvens: (konsekvensIndex: number) => void;
  setSannsynlighet: (sannsynlighetIndex: number) => void;
  selectedKonsekvens: number;
  selectedSannsynlighet: number;
}

export const TabPanelStartrisiko = ({
  setKonsekvens,
  setSannsynlighet,
  selectedKonsekvens,
  selectedSannsynlighet,
}: TabPanelStartrisikoProps) => {
  const { tabPanel } = tabStyles();
  const { headerSubtitle } = useFontStyles();

  return (
    <TabPanel className={tabPanel} value="startrisiko">
      <Typography variant="h5">Startrisiko</Typography>
      <Typography className={headerSubtitle}>
        Hvor alvorlig er den potensielle konsekvensen i det relevante området?
        Hvis konsekvensen er relevant for flere områder gjelder det høyeste
        konsekvensnivået.
      </Typography>
      <KonsekvensTable
        selectedValue={selectedKonsekvens}
        handleChange={setKonsekvens}
      />
      <Typography variant="h5">Sannsynlighet</Typography>
      <Typography className={headerSubtitle}>
        Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme
        Dersom du er mellom to sannsynlighetsverdier velger du den høyeste.
      </Typography>

      <SannsynlighetTable
        selectedValue={selectedSannsynlighet}
        handleChange={setSannsynlighet}
      />
    </TabPanel>
  );
};
