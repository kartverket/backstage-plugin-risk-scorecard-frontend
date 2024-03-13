import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { useROSPlugin, useScenarioDrawer } from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../ScenarioDrawer/Dropdown';
import { ROS, RosStatus } from '../utils/types';
import Alert from '@mui/material/Alert';
import { emptyROS, getAlertSeverity } from '../utils/utilityfunctions';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoadingStyles } from './rosPluginStyle';
import { ScenarioContext } from './ScenarioContext';
import { useFontStyles } from '../ScenarioDrawer/style';
import { RosInfo } from '../rosInfo/RosInfo';
import { ROSDialog } from '../ROSDialog/ROSDialog';

export enum ROSDialogStates {
  Closed,
  Edit,
  Create,
}

export const ROSPlugin = () => {
  // const [ROSDialogIsOpen, setROSDialogIsOpen] = useState<boolean>(false);
  // const [isNewROS, setIsNewROS] = useState<boolean>(false);
  const [ROSDialogState, setROSDialogState] = useState<ROSDialogStates>(
    ROSDialogStates.Closed,
  );

  const openCreateRosDialog = () => setROSDialogState(ROSDialogStates.Create);
  const openEditRosDialog = () => setROSDialogState(ROSDialogStates.Edit);
  const closeRosDialog = () => setROSDialogState(ROSDialogStates.Closed);

  const { useFetchRoses, postROS, putROS, publishROS, response } =
    useROSPlugin();

  const {
    selectedROS,
    setSelectedROS,

    roses,
    setRoses,
    selectROSByTitle,
    isFetching,
    setIsFetching,
  } = useFetchRoses();

  const createNewROS = (ros: ROS) => {
    setIsFetching(true);
    setSelectedROS(null);
    postROS(
      ros,
      res => {
        if (!res.rosId) throw new Error('No ROS ID returned');

        const newROS = {
          id: res.rosId,
          title: ros.tittel,
          status: RosStatus.Draft,
          content: ros,
        };

        setRoses(roses ? [...roses, newROS] : [newROS]);
        setSelectedROS(newROS);
        setIsFetching(false);
      },
      () => {
        setSelectedROS(selectedROS);
        setIsFetching(false);
      },
    );
  };

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

  const scenario = useScenarioDrawer(selectedROS?.content ?? null, updateROS);

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
                  options={roses.map(ros => ros.title) ?? []}
                  selectedValues={selectedROS?.title ?? ''}
                  handleChange={title => selectROSByTitle(title)}
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
                  <RosInfo
                    ros={selectedROS}
                    approveROS={approveROS}
                    edit={openEditRosDialog}
                  />
                </Grid>
                <Grid item xs={4}>
                  <RiskMatrix ros={selectedROS.content} />
                </Grid>
                <Grid item xs={8}>
                  <ScenarioTable ros={selectedROS.content} />
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
