import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { useFetchRoses, useScenarioDrawer } from '../utils/hooks';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../utils/Dropdown';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../utils/utilityfunctions';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoadingStyles } from './rosPluginStyle';
import { ScenarioContext } from './ScenarioContext';
import { useFontStyles } from '../scenarioDrawer/style';
import { useParams } from 'react-router';
import { ROSInfo } from '../rosInfo/ROSInfo';
import {ROSDialog, ROSDialogStates} from '../rosDialog/ROSDialog';
import { ScenarioTable } from '../scenarioTable/ScenarioTable';
import {Route, Routes} from "react-router-dom";
import {rosRouteRef, scenarioRouteRef} from "../../routes";

export const ROSPlugin = () => {
  return (
      <Routes>
        <Route path="/" element={<Plugin />} />
        <Route path={rosRouteRef.path} element={<Plugin />} />
        <Route path={scenarioRouteRef.path} element={<Plugin />} />
      </Routes>
  );
};

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

  return (
    <>
      <ScenarioContext.Provider value={scenario}>
        {response && (
          <Alert severity={getAlertSeverity(response.status)}>
            <Typography>{response.statusMessage}</Typography>
          </Alert>
        )}

        <Content>
          <ContentHeader title="Risiko- og sårbarhetsanalyse">
            <SupportButton>Kul plugin ass!</SupportButton>
          </ContentHeader>

          {isFetching && (
            <div className={classes.container}>
              <CircularProgress className={classes.spinner} size={80} />
            </div>
          )}

          <Grid container spacing={3}>
            {roses !== null && roses.length !== 0 && (
              <Grid item xs={3}>
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
                >
                  Opprett ny analyse
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
                <Grid item xs={8}>
                  <ScenarioTable ros={selectedROS.content} />
                </Grid>
                <Grid item xs={4}>
                  <RiskMatrix ros={selectedROS.content} />
                </Grid>
              </>
            )}
          </Grid>

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
        </Content>
      </ScenarioContext.Provider>
    </>
  );
};
