import React, { useEffect, useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { ContentHeader } from '@backstage/core-components';
import { useFetchRiScs, useScenarioDrawer } from '../utils/hooks';
import { useParams } from 'react-router';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import { riScRouteRef, scenarioRouteRef } from '../../routes';
import {
  ScenarioWizard,
  ScenarioWizardSteps,
} from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { ScenarioTable } from '../scenarioTable/ScenarioTable';
import { ScenarioContext } from './ScenarioContext';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { Dropdown } from '../utils/Dropdown';
import { RiScDialog, RiScDialogStates } from '../riScDialog/RiScDialog';
import { RiScInfo } from '../riScInfo/RiScInfo';
import AddCircle from '@material-ui/icons/AddCircle';
import { Spinner } from '../utils/Spinner';

const Plugin = () => {
  const params = useParams();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [RiScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  const openCreateRiScDialog = () =>
    setRiScDialogState(RiScDialogStates.Create);
  const openEditRiScDialog = () => setRiScDialogState(RiScDialogStates.Edit);
  const closeRiScDialog = () => setRiScDialogState(RiScDialogStates.Closed);

  const {
    selectedRiSc,
    riScs,
    selectRiSc,
    isFetching,
    createNewRiSc,
    updateRiSc,
    updateRiScStatus,
    resetRiScStatus,
    approveRiSc,
    response,
  } = useFetchRiScs(params.riScId);

  const scenario = useScenarioDrawer(
    selectedRiSc ?? null,
    updateRiSc,
    params.scenarioId,
  );

  const [searchParams] = useSearchParams();
  const scenarioWizardStep =
    (searchParams.get('step') as ScenarioWizardSteps | null) || null;

  useEffect(() => {
    if (scenarioWizardStep !== null) resetRiScStatus();
  }, [resetRiScStatus, scenarioWizardStep]);

  return (
    <>
      <ScenarioContext.Provider value={scenario}>
        {response && (
          <Alert severity={getAlertSeverity(response.status)}>
            <Typography>{response.statusMessage}</Typography>
          </Alert>
        )}

        {scenarioWizardStep !== null ? (
          <ScenarioWizard
            step={scenarioWizardStep}
            isFetching={isFetching}
            updateStatus={updateRiScStatus}
          />
        ) : (
          <>
            <ContentHeader title={t('contentHeader.title')} />

            {isFetching && <Spinner size={80} />}

            <Grid container spacing={4}>
              {riScs !== null && riScs.length !== 0 && (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  style={{
                    maxWidth: '600px',
                    minWidth: '300px',
                  }}
                >
                  <Dropdown<string>
                    options={riScs.map(riSc => riSc.content.title) ?? []}
                    selectedValues={selectedRiSc?.content.title ?? ''}
                    handleChange={title => selectRiSc(title)}
                    variant="standard"
                  />
                </Grid>
              )}

              {!isFetching && (
                <Grid item xs>
                  <Button
                    startIcon={<AddCircle />}
                    variant="text"
                    color="primary"
                    onClick={openCreateRiScDialog}
                    style={{
                      minWidth: '205px',
                    }}
                  >
                    {t('contentHeader.createNewButton')}
                  </Button>
                </Grid>
              )}

              {selectedRiSc && (
                <>
                  <Grid item xs={12}>
                    <RiScInfo
                      riSc={selectedRiSc}
                      approveRiSc={approveRiSc}
                      edit={openEditRiScDialog}
                    />
                  </Grid>
                  <Grid item xs md={7} lg={8}>
                    <ScenarioTable riSc={selectedRiSc.content} />
                  </Grid>
                  <Grid item xs md={5} lg={4}>
                    <RiskMatrix riSc={selectedRiSc.content} />
                  </Grid>
                </>
              )}
            </Grid>
          </>
        )}

        {RiScDialogState !== RiScDialogStates.Closed && (
          <RiScDialog
            onClose={closeRiScDialog}
            createNewRiSc={createNewRiSc}
            updateRiSc={updateRiSc}
            riSc={selectedRiSc}
            dialogState={RiScDialogState}
          />
        )}

        {!scenarioWizardStep && <ScenarioDrawer />}
      </ScenarioContext.Provider>
    </>
  );
};

export const RiScPlugin = () => {
  return (
    <Routes>
      <Route path="/" element={<Plugin />} />
      <Route path={riScRouteRef.path} element={<Plugin />} />
      <Route path={scenarioRouteRef.path} element={<Plugin />} />
    </Routes>
  );
};
