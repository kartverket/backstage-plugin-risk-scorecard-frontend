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
  useGithubRepositoryInformation,
  useScenarioDrawer,
} from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import { ROS } from '../interface/interfaces';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { postROS } from '../utils/rosFunctions';
import { RosStatus } from '../utils/types';
import {
  githubPostRequestHeaders,
  uriToPublishROS,
  uriToPutROS,
} from '../utils/utilityfunctions';
import {
  ROSStatusAlertNotApprovedByRisikoeier,
  ROSStatusComponent,
} from '../ROSStatus/ROSStatusComponent';
import { getROSStatus } from '../ROSStatusChip/StatusChip';
import { DeleteConfirmation } from './DeleteConfirmation';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../ScenarioDrawer/Dropdown';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const repoInfo = useGithubRepositoryInformation();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const [submitResponse, displaySubmitResponse] = useDisplaySubmitResponse();

  const [
    rosIds,
    setRosIds,
    selectedId,
    setSelectedId,
    rosIdsWithStatus,
    setRosIdsWithStatus,
  ] = useFetchRosIds(token, repoInfo);

  const [ros, setRos] = useFetchRos(selectedId, token, repoInfo);

  const [selectedRosStatus, setSelectedRosStatus] = useState<RosStatus | null>(
    getROSStatus(rosIdsWithStatus, selectedId),
  );

  useEffect(() => {
    setSelectedRosStatus(getROSStatus(rosIdsWithStatus, selectedId));
  }, [rosIdsWithStatus, selectedId]);

  const putROS = (updatedROS: ROS) => {
    if (repoInfo && token && selectedId) {
      fetch(uriToPutROS(baseUrl, repoInfo, selectedId), {
        method: 'PUT',
        headers: githubPostRequestHeaders(token),
        body: JSON.stringify({ ros: JSON.stringify(updatedROS) }),
      }).then(res => {
        if (res.ok) displaySubmitResponse('ROS ble oppdatert!');
        else res.text().then(text => displaySubmitResponse(text));
      });
    }
  };

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
      baseUrl,
      repoInfo,
      token,
      rosProcessingResult => {
        if (!rosProcessingResult.rosId) return;
        const updatedRosIds = rosIds
          ? [...rosIds, rosProcessingResult.rosId]
          : [rosProcessingResult.rosId];
        const newRosIdWithDraftStatus = {
          id: rosProcessingResult.rosId,
          status: RosStatus.Draft,
        };
        const updatedRosIdsWithStatus = rosIdsWithStatus
          ? [...rosIdsWithStatus, newRosIdWithDraftStatus]
          : [newRosIdWithDraftStatus];

        setRosIds(updatedRosIds);
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
  } = useScenarioDrawer(ros, setRos, setDrawerIsOpen, putROS);

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
              options={rosIds}
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

        {/* TODO: Håndetering av tidligere skjemaer */}
        {ros && ros.tittel && ros.omfang && (
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={9}>
                <Grid container spacing={1}>
                  <Grid item xs={10}>
                    <Grid item xs={12}>
                      <ROSStatusAlertNotApprovedByRisikoeier
                        currentROSId={selectedId}
                        rosIdsWithStatus={rosIdsWithStatus}
                        rosStatus={selectedRosStatus}
                      ></ROSStatusAlertNotApprovedByRisikoeier>
                    </Grid>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography variant="subtitle2">
                      {' '}
                      Tittel: {ros.tittel}
                    </Typography>
                  </Grid>

                  <Grid item xs={10}>
                    <Typography variant="subtitle2">
                      Omfang: {ros.omfang}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {rosIdsWithStatus && selectedId && selectedRosStatus && (
                <ROSStatusComponent
                  currentROSId={selectedId}
                  currentRosStatus={selectedRosStatus}
                  publishRosFn={publishROS}
                />
              )}
            </Grid>
          </Grid>
        )}

        {ros && (
          <Grid item xs={6}>
            <RiskMatrix ros={ros} />
          </Grid>
        )}

        {ros && (
          <Grid item xs={12}>
            <ScenarioTable
              ros={ros}
              addScenario={() => setDrawerIsOpen(true)}
              deleteRow={openDeleteConfirmation}
              editRow={editScenario}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography>{submitResponse}</Typography>
        </Grid>
      </Grid>

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
    </Content>
  );
};
