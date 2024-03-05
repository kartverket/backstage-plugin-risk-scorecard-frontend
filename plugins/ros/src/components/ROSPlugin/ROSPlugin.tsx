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
import { ScenarioContext } from './ScenarioContext';
import { useFontStyles } from '../ScenarioDrawer/style';

export const ROSPlugin = () => {
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

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
    <ScenarioContext.Provider value={scenario}>
      <Content>
        <ContentHeader title="Risiko- og sårbarhetsanalyse">
          <SupportButton>Kul plugin ass!</SupportButton>
        </ContentHeader>

        {isFetching && (
          <div className={classes.container}>
            <Grid item>
              <CircularProgress className={classes.spinner} size={80} />
            </Grid>
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
            <Grid item xs={9}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="text"
                color="primary"
                onClick={() => setNewROSDialogIsOpen(true)}
                className={button}
              >
                Opprett ny analyse
              </Button>
            </Grid>
          )}

          {selectedROS && (
            <>
              <Grid item xs={6}>
                <Typography variant="subtitle2">
                  Omfang: {selectedROS.content.omfang}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <ROSStatusComponent
                  selectedROS={selectedROS}
                  publishRosFn={approveROS}
                />
              </Grid>

              <Grid item xs={6}>
                <RiskMatrix ros={selectedROS.content} />
              </Grid>
              <Grid item xs={6}>
                <ScenarioTable ros={selectedROS.content} />
              </Grid>
            </>
          )}

          {response && (
            <Grid item xs={12}>
              <Alert severity={getAlertSeverity(response.status)}>
                <Typography>{response.statusMessage}</Typography>
              </Alert>
            </Grid>
          )}
        </Grid>

        <ROSDialog
          isOpen={newROSDialogIsOpen}
          onClose={() => setNewROSDialogIsOpen(false)}
          saveRos={createNewROS}
        />

        <ScenarioDrawer />

        <DeleteConfirmation />

        <ROSStatusAlertNotApprovedByRisikoeier
          selectedROS={selectedROS}
          roses={roses}
        />
      </Content>
    </ScenarioContext.Provider>
  );
};
