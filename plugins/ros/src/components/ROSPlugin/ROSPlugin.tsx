import React, { useState } from 'react';
import { Button, Grid, Typography, makeStyles } from '@material-ui/core';
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
import { ROS } from '../utils/interfaces';
import { ROSProcessingStatus, RosStatus } from '../utils/types';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export const ROSPlugin = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const { useFetchRoses, postROS, putROS, publishROS, response } =
    useROSPlugin();

  const [
    selectedROS,
    setSelectedROS,
    titlesAndIds,
    setTitlesAndIds,
    selectedTitleAndId,
    selectROSByTitle,
  ] = useFetchRoses();

  const createNewROS = (ros: ROS) =>
    postROS(ros, res => {
      if (!res.rosId) return;
      const newROSId = {
        id: res.rosId,
        status: RosStatus.Draft,
        title: ros.tittel,
      };
      setTitlesAndIds(titlesAndIds ? [...titlesAndIds, newROSId] : [newROSId]);
      selectROSByTitle(ros.tittel);
    });

  const updateROS = (ros: ROS) => {
    if (selectedTitleAndId) {
      selectROSByTitle(ros.tittel);
      putROS(ros, selectedTitleAndId.id);
    }
  };

  const approveROS = () => {
    if (selectedTitleAndId) {
      publishROS(selectedTitleAndId.id);
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
  } = useScenarioDrawer(selectedROS, setDrawerIsOpen, updateROS);

  const useStyles = makeStyles({
    container: {
      minWidth: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const classes = useStyles();

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      {!titlesAndIds && (
        <div className={classes.container}>
          <Grid item xl={12} justifyContent="center" alignItems="center">
            <CircularProgress size={80} />
          </Grid>
        </div>
      )}

      <Grid container spacing={3} direction="column">
        {titlesAndIds && (
          <>
            <Grid item xs={3}>
              <Dropdown
                label="ROS-analyser"
                options={titlesAndIds.map(ros => ros.title) ?? []}
                selectedValues={
                  selectedTitleAndId?.title ? [selectedTitleAndId.title] : []
                }
                handleChange={e => selectROSByTitle(e.target.value as string)}
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

        {selectedTitleAndId && selectedROS && selectedROS.omfang && (
          <>
            <Grid item container direction="row">
              <Grid item container xs direction="column" spacing={0}>
                <Grid item xs>
                  <Typography variant="subtitle2">
                    ID: {selectedTitleAndId.id}
                  </Typography>
                </Grid>

                <Grid item xs>
                  <Typography variant="subtitle2">
                    Omfang: {selectedROS.omfang}
                  </Typography>
                </Grid>
              </Grid>
              <ROSStatusComponent
                selectedId={selectedTitleAndId}
                publishRosFn={approveROS}
              />
            </Grid>

            <Grid item container direction="row">
              <Grid item xs>
                <RiskMatrix ros={selectedROS} />
              </Grid>
              <Grid item xs>
                <ScenarioTable
                  ros={selectedROS}
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

      <ROSDialog
        isOpen={newROSDialogIsOpen}
        onClose={() => setNewROSDialogIsOpen(false)}
        setRos={setSelectedROS}
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
      {selectedTitleAndId && titlesAndIds && (
        <ROSStatusAlertNotApprovedByRisikoeier
          currentROSId={selectedTitleAndId}
          rosTitleAndIds={titlesAndIds}
        />
      )}
    </Content>
  );
};
