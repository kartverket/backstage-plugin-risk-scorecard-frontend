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
import { ROS } from '../interface/interfaces';
import { ROSProcessingStatus, RosStatus } from '../utils/types';
import { Alert } from '@mui/material';

export const ROSPlugin = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const { useFetchRos, useFetchRosIds, postROS, putROS, publishROS, response } =
    useROSPlugin();

  const [selectedId, setSelectedId, rosIds, setRosIds] = useFetchRosIds();
  const [ros, setRos] = useFetchRos(selectedId);

  const createNewROS = (ros: ROS) =>
    postROS(ros, res => {
      if (!res.rosId) return;
      const newROSId = {
        id: res.rosId,
        status: RosStatus.Draft,
      };
      setRosIds(rosIds ? [...rosIds, newROSId] : [newROSId]);
      setSelectedId(newROSId);
    });

  const updateROS = (ros: ROS) => {
    if (selectedId) {
      setRos(ros);
      putROS(ros, selectedId.id);
    }
  };

  const approveROS = () => {
    if (selectedId) {
      publishROS(selectedId.id);
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
  } = useScenarioDrawer(ros, setDrawerIsOpen, updateROS);

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        {rosIds && selectedId && (
          <Grid item xs={3}>
            <Dropdown
              label={'ROS-analyser'}
              options={rosIds.map(r => r.id)}
              selectedValues={[selectedId.id]}
              handleChange={e =>
                setSelectedId(rosIds.find(r => r.id === e.target.value)!)
              }
              variant="standard"
            />
          </Grid>
        )}

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

        {rosIds && selectedId && ros && (
          <>
            <Grid item container direction="row">
              <Grid item container xs direction="column" spacing={0}>
                <Grid item xs>
                  <Typography variant="subtitle2">
                    Tittel: {ros.tittel}
                  </Typography>
                </Grid>

                <Grid item xs>
                  <Typography variant="subtitle2">
                    Omfang: {ros.omfang}
                  </Typography>
                </Grid>
              </Grid>
              <ROSStatusComponent
                selectedId={selectedId}
                publishRosFn={approveROS}
              />
            </Grid>

            <Grid item container direction="row">
              <Grid item xs>
                <RiskMatrix ros={ros} />
              </Grid>
              <Grid item xs>
                <ScenarioTable
                  ros={ros}
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
            <Alert
              severity={
                response.status === ROSProcessingStatus.UpdatedROS
                  ? 'info'
                  : 'warning'
              }
            >
              <Typography>{response?.statusMessage}</Typography>
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* --- Popups --- */}

      <ROSDialog
        isOpen={newROSDialogIsOpen}
        onClose={() => setNewROSDialogIsOpen(false)}
        setRos={setRos}
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
        currentROSId={selectedId}
        ROSIds={rosIds}
      />
    </Content>
  );
};
