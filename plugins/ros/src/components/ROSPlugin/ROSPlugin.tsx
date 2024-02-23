import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { useROSPlugin, useScenarioDrawer } from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {
  ROSStatusAlertNotApprovedByRisikoeier,
  ROSStatusComponent,
} from '../ROSStatus/ROSStatusComponent';
import { DeleteConfirmation } from './DeleteConfirmation';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../ScenarioDrawer/Dropdown';
import { ROS, RosStatus } from '../utils/types';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../utils/utilityfunctions';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoadingStyles } from './rosPluginStyle';

export const ROSPlugin = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const { useFetchRoses, postROS, putROS, publishROS, response } =
    useROSPlugin();

  const { selectedROS, setSelectedROS, roses, setRoses, selectROSByTitle } =
    useFetchRoses();

  const createNewROS = (ros: ROS) =>
    postROS(ros, res => {
      if (!res.rosId) {
        throw new Error('No ROS ID returned');
      }

      const newROS = {
        id: res.rosId,
        title: ros.tittel,
        status: RosStatus.Draft,
        content: ros,
      };

      setRoses(roses ? [...roses, newROS] : [newROS]);
      setSelectedROS(newROS);
    });

  const updateROS = (ros: ROS) => {
    if (selectedROS && roses) {
      const updatedROS = { ...selectedROS, content: ros };
      setSelectedROS(updatedROS);
      setRoses(roses.map(r => (r.id === selectedROS.id ? updatedROS : r)));
      putROS(updatedROS);
    }
  };

  const approveROS = () => {
    if (selectedROS && roses) {
      const updatedROS = { ...selectedROS, status: RosStatus.SentForApproval };
      setSelectedROS(updatedROS);
      setRoses(roses.map(r => (r.id === selectedROS.id ? updatedROS : r)));
      publishROS(selectedROS.id);
    }
  };

  const {
    scenario,
    setScenario,
    saveScenario,
    editScenario,
    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeletion,
  } = useScenarioDrawer(
    selectedROS?.content ?? null,
    setDrawerIsOpen,
    updateROS,
  );

  const classes = useLoadingStyles();

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      {!roses && (
        <div className={classes.container}>
          <Grid item>
            <CircularProgress className={classes.spinner} size={80} />
          </Grid>
        </div>
      )}

      <Grid container spacing={3} direction="column">
        {roses && (
          <>
            <Grid item xs={3}>
              <Dropdown<string>
                label="ROS-analyser"
                options={roses.map(ros => ros.title) ?? []}
                selectedValues={selectedROS?.title ? selectedROS.title : ''}
                handleChange={title => selectROSByTitle(title)}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="text"
                color="primary"
                onClick={() => setNewROSDialogIsOpen(true)}
              >
                Opprett ny analyse
              </Button>
            </Grid>
          </>
        )}

        {selectedROS && (
          <>
            <Grid item container direction="row">
              <Grid item container xs direction="column" spacing={0}>
                <Grid item xs>
                  <Typography variant="subtitle2">
                    ID: {selectedROS.id}
                  </Typography>
                </Grid>

                <Grid item xs>
                  <Typography variant="subtitle2">
                    Omfang: {selectedROS.content.omfang}
                  </Typography>
                </Grid>
              </Grid>
              <ROSStatusComponent
                selectedROS={selectedROS}
                publishRosFn={approveROS}
              />
            </Grid>

            <Grid item container direction="row">
              <Grid item xs>
                <RiskMatrix ros={selectedROS.content} />
              </Grid>
              <Grid item xs>
                <ScenarioTable
                  ros={selectedROS.content}
                  addScenario={() => setDrawerIsOpen(true)}
                  deleteRow={openDeleteConfirmation}
                  editRow={editScenario}
                />
              </Grid>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          {response && (
            <Alert severity={getAlertSeverity(response.status)}>
              <Typography>{response.statusMessage}</Typography>
            </Alert>
          )}
        </Grid>
      </Grid>

      <ROSDialog
        isOpen={newROSDialogIsOpen}
        onClose={() => setNewROSDialogIsOpen(false)}
        saveRos={createNewROS}
      />
      <ScenarioDrawer
        isOpen={drawerIsOpen}
        setIsOpen={setDrawerIsOpen}
        scenario={scenario}
        setScenario={setScenario}
        saveScenario={saveScenario}
      />
      <DeleteConfirmation
        isOpen={deleteConfirmationIsOpen}
        close={closeDeleteConfirmation}
        confirmDeletion={confirmDeletion}
      />
      <ROSStatusAlertNotApprovedByRisikoeier
        selectedROS={selectedROS}
        roses={roses}
      />
    </Content>
  );
};
