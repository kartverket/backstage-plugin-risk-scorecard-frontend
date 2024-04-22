import React, { useState } from 'react';
import { Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { useFetchRoses, useScenarioDrawer } from '../utils/hooks';
import { useLoadingStyles } from './rosPluginStyle';
import { useFontStyles } from '../scenarioDrawer/style';
import { useParams } from 'react-router';
import { ROSDialog, ROSDialogStates } from '../rosDialog/ROSDialog';
import { Route, Routes } from 'react-router-dom';
import { rosRouteRef, scenarioRouteRef } from '../../routes';
import { ScenarioWizard } from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { ScenarioTable } from '../scenarioTable/ScenarioTable';
import { ROSInfo } from '../rosInfo/ROSInfo';
import { ScenarioContext } from './ScenarioContext';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';
import { Dropdown } from '../utils/Dropdown';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const Plugin = () => {
  const params = useParams();

  const [ROSDialogState, setROSDialogState] = useState<ROSDialogStates>(
    ROSDialogStates.Closed,
  );

  const openCreateRosDialog = () => setROSDialogState(ROSDialogStates.Create);
  const openEditRosDialog = () => setROSDialogState(ROSDialogStates.Edit);
  const closeRosDialog = () => setROSDialogState(ROSDialogStates.Closed);

  const {
    selectedROS,
    roses,
    selectRos,
    isFetching,
    createNewROS,
    updateROS,
    approveROS,
    response,
  } = useFetchRoses(params.rosId);

  const scenario = useScenarioDrawer(
    selectedROS ?? null,
    updateROS,
    params.scenarioId,
  );

  const classes = useLoadingStyles();
  const { button } = useFontStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <ScenarioContext.Provider value={scenario}>
        {response && (
          <Alert severity={getAlertSeverity(response.status)}>
            <Typography>{response.statusMessage}</Typography>
          </Alert>
        )}

        {scenario.scenarioWizardStep !== null ? (
          <ScenarioWizard step={scenario.scenarioWizardStep} />
        ) : (
          <>
            <ContentHeader title={t('contentHeader.title')}>
              <SupportButton>Kul plugin ass!</SupportButton>
            </ContentHeader>

            {isFetching && (
              <div className={classes.container}>
                <CircularProgress className={classes.spinner} size={80} />
              </div>
            )}

            <Grid container spacing={4}>
              {roses !== null && roses.length !== 0 && (
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
                    options={roses.map(ros => ros.content.tittel) ?? []}
                    selectedValues={selectedROS?.content.tittel ?? ''}
                    handleChange={title => selectRos(title)}
                    variant="standard"
                  />
                </Grid>
              )}

              {!isFetching && (
                <Grid item xs>
                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    variant="text"
                    color="primary"
                    onClick={openCreateRosDialog}
                    className={button}
                    style={{
                      minWidth: '205px',
                    }}
                  >
                    {t('contentHeader.createNewButton')}
                  </Button>
                </Grid>
              )}

              {selectedROS && (
                <>
                  <Grid item xs={12}>
                    <ROSInfo
                      ros={selectedROS}
                      approveROS={approveROS}
                      edit={openEditRosDialog}
                    />
                  </Grid>
                  <Grid item xs md={7} lg={8}>
                    <ScenarioTable ros={selectedROS.content} />
                  </Grid>
                  <Grid item xs md={5} lg={4}>
                    <RiskMatrix ros={selectedROS.content} />
                  </Grid>
                </>
              )}
            </Grid>
          </>
        )}

        {ROSDialogState !== ROSDialogStates.Closed && (
          <ROSDialog
            onClose={closeRosDialog}
            createNewRos={createNewROS}
            updateRos={updateROS}
            ros={selectedROS}
            dialogState={ROSDialogState}
          />
        )}

        <ScenarioDrawer />
      </ScenarioContext.Provider>
    </>
  );
};

export const ROSPlugin = () => {
  return (
    <Routes>
      <Route path="/" element={<Plugin />} />
      <Route path={rosRouteRef.path} element={<Plugin />} />
      <Route path={scenarioRouteRef.path} element={<Plugin />} />
    </Routes>
  );
};
