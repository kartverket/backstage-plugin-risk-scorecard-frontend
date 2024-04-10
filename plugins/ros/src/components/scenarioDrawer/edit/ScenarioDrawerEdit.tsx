import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Typography } from '@material-ui/core';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
import TabContext from '@material-ui/lab/TabContext';
import { Tabs } from './tabs/Tabs';
import {
  konsekvensOptions,
  sannsynlighetOptions,
  sårbarheterOptions,
  trusselaktørerOptions,
} from '../../utils/constants';
import { CloseConfirmation } from './CloseConfirmation';
import {
  getKonsekvensLevel,
  getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import DeleteIcon from '@mui/icons-material/Delete';
import { TextField } from '../../utils/Textfield';
import { Dropdown } from '../../utils/Dropdown';
import { TabPanelKonsekvens } from './tabs/konsekvens/TabPanelKonsekvens';
import { TabPanelSannsynlighet } from './tabs/sannsynlighet/TabPanelSannsynlighet';
import { TabPanelTiltak } from './tabs/tiltak/TabPanelTiltak';
import { DeleteConfirmation } from './DeleteConfirmation';
import { pluginTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ScenarioDrawerEdit = () => {
  const { header, buttons } = useScenarioDrawerContentStyles();
  const { h1, headerSubtitle, labelSubtitle, button, label } = useFontStyles();
  const { t } = useTranslationRef(pluginTranslationRef);

  const {
    scenario,
    originalScenario,
    saveScenario,
    scenarioErrors,
    openDeleteConfirmation,
    setTittel,
    setBeskrivelse,
    setTrusselaktører,
    setSårbarheter,
    setSannsynlighet,
    setKonsekvens,
    addTiltak,
    updateTiltak,
    deleteTiltak,
    updateRestrisiko,
    closeScenario,
  } = useContext(ScenarioContext)!!;

  const [tab, setTab] = useState('konsekvens');

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const close = () => {
    closeScenario();
    setShowCloseConfirmation(false);
  };

  const saveAndClose = () => {
    if (saveScenario()) {
      close();
    }
  };

  const handleCloseDrawer = () => {
    if (JSON.stringify(scenario) !== JSON.stringify(originalScenario)) {
      setShowCloseConfirmation(true);
    } else {
      close();
    }
  };

  return (
    <>
      <Box className={header}>
        <Typography className={h1}>{t('scenarioDrawer.title')}</Typography>

        <Button
          className={button}
          variant="outlined"
          color="primary"
          onClick={handleCloseDrawer}
          endIcon={<KeyboardTabIcon />}
        >
          {t('dictionary.close')}
        </Button>
      </Box>
      <Typography className={headerSubtitle}>
        {t('scenarioDrawer.subtitle')}
      </Typography>

      <Grid container>
        <Grid item xs={12}>
          <TextField
            label={t('dictionary.title')}
            value={scenario.tittel}
            error={scenarioErrors.tittel}
            required
            minRows={1}
            handleChange={setTittel}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.threatActors')}
          </Typography>
          <Typography className={labelSubtitle}>
            {t('scenarioDrawer.threatActorSubtitle')}
          </Typography>
          <Dropdown<string[]>
            selectedValues={scenario.trusselaktører}
            options={trusselaktørerOptions}
            handleChange={setTrusselaktører}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.vulnerabilities')}
          </Typography>
          <Typography className={labelSubtitle}>
            {t('scenarioDrawer.vulnerabilitySubtitle')}
          </Typography>

          <Dropdown<string[]>
            selectedValues={scenario.sårbarheter}
            options={sårbarheterOptions}
            handleChange={setSårbarheter}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('dictionary.description')}
            value={scenario.beskrivelse}
            minRows={4}
            handleChange={setBeskrivelse}
          />
        </Grid>

        <Grid item xs={12}>
          <TabContext value={tab}>
            <Tabs setTab={setTab} />
            <TabPanelKonsekvens
              selected={getKonsekvensLevel(scenario.risiko)}
              setKonsekvens={setKonsekvens}
            />
            <TabPanelSannsynlighet
              selected={getSannsynlighetLevel(scenario.risiko)}
              setSannsynlighet={setSannsynlighet}
              options={sannsynlighetOptions.map((_, index) =>
                (index + 1).toString(),
              )}
            />
            <TabPanelTiltak
              scenario={scenario}
              updateTiltak={updateTiltak}
              deleteTiltak={deleteTiltak}
              addTiltak={addTiltak}
              updateRestrisiko={updateRestrisiko}
              options={konsekvensOptions.map((_, index) =>
                (index + 1).toString(),
              )}
            />
          </TabContext>
        </Grid>

        <Grid item xs={12} className={buttons} style={{ paddingTop: '1rem' }}>
          <Button variant="contained" color="primary" onClick={saveAndClose}>
            {t('dictionary.save')}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleCloseDrawer}
          >
            {t('dictionary.cancel')}
          </Button>

          <Grid
            item
            container
            xs={12}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button
              startIcon={<DeleteIcon />}
              variant="text"
              color="primary"
              onClick={openDeleteConfirmation}
            >
              {t('scenarioDrawer.deleteScenarioButton')}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <DeleteConfirmation />

      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={close}
        save={saveAndClose}
      />
    </>
  );
};
