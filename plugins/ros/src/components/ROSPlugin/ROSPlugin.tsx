import React, { useEffect, useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import {
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import {
  useBaseUrl,
  useDisplaySubmitResponse,
  useFetchRos,
  useFetchRosIds,
  useScenarioDrawer,
} from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import { ROS } from '../interface/interfaces';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { RosStatus } from '../utils/types';
import { githubPostRequestHeaders } from '../utils/utilityfunctions';
import {
  ROSStatusAlertNotApprovedByRisikoeier,
  ROSStatusComponent,
} from '../ROSStatus/ROSStatusComponent';
import { getROSStatus } from '../ROSStatusChip/StatusChip';
import { DeleteConfirmation } from './DeleteConfirmation';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../ScenarioDrawer/Dropdown';
import { useFetch } from '../utils/rosFunctions';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const [submitResponse, displaySubmitResponse] = useDisplaySubmitResponse();

  const [selectedId, setSelectedId, rosIdsWithStatus, setRosIdsWithStatus] =
    useFetchRosIds();

  const [ros, setRos] = useFetchRos(selectedId);

  const [selectedRosStatus, setSelectedRosStatus] = useState<RosStatus | null>(
    getROSStatus(rosIdsWithStatus, selectedId),
  );

  useEffect(() => {
    setSelectedRosStatus(getROSStatus(rosIdsWithStatus, selectedId));
  }, [rosIdsWithStatus, selectedId]);

  const { fetchROSIds, fetchROS, postROS } = useFetch();

  const publishROS = () => {
    if (repoInfo && token && selectedId) {
      fetch(uriToPublishROS(baseUrl, repoInfo, selectedId), {
        method: 'POST',
        headers: githubPostRequestHeaders(token),
      }).then(res => {
        if (res.ok) {
          displaySubmitResponse('Det ble opprettet en PR for ROSen!');
        } else res.text().then(text => displaySubmitResponse(text));
      });
    }
  };

  const createNewROS = (newRos: ROS) => {
    postROS(
      newRos,
      rosProcessingResult => {
        if (!rosProcessingResult.rosId) return;
        const newRosIdWithDraftStatus = {
          id: rosProcessingResult.rosId,
          status: RosStatus.Draft,
        };
        const updatedRosIdsWithStatus = rosIdsWithStatus
          ? [...rosIdsWithStatus, newRosIdWithDraftStatus]
          : [newRosIdWithDraftStatus];

        setRosIdsWithStatus(updatedRosIdsWithStatus);
        setSelectedId(rosProcessingResult.rosId);
        // spinn og ikke kunne redigere før her
      },
      (error: string) => {
        console.log(error);
      },
    );
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
  } = useScenarioDrawer(ros, setRos, setDrawerIsOpen);

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        {rosIdsWithStatus && selectedId && (
          <Grid item xs={3}>
            <Dropdown
              label={'ROS-analyser'}
              options={rosIdsWithStatus.map(r => r.id)}
              selectedValues={[selectedId]}
              handleChange={e => setSelectedId(e.target.value as string)}
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

        {rosIdsWithStatus && selectedId && selectedRosStatus && ros && (
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
                currentROSId={selectedId}
                currentRosStatus={selectedRosStatus}
                publishRosFn={publishROS}
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
          <Typography>{submitResponse}</Typography>
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
        rosIdsWithStatus={rosIdsWithStatus}
        rosStatus={selectedRosStatus}
      />
    </Content>
  );
};
