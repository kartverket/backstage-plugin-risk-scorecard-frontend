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
  microsoftAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
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
import {
  ROSProcessingStatus,
  ROSProcessResultDTO,
  RosStatus,
} from '../utils/types';
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
import Alert from '@mui/material/Alert';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const [ghToken, setGhToken] = useState<string | null>(null);
  githubApi
    .getAccessToken('repo')
    .then(token => setGhToken(token))
    .catch(() => setGhToken(null));

  const microsoftApi = useApi(microsoftAuthApiRef);
  const [microsoftToken, setMicrosoftToken] = useState<string | null>(null);
  microsoftApi.getIdToken().then(token => setMicrosoftToken(token));

  const baseUrl = useBaseUrl();
  const repoInfo = useGithubRepositoryInformation();
  const { fetch } = useApi(fetchApiRef);

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const [submitResponse, displaySubmitResponse] = useDisplaySubmitResponse();

  const [selectedId, setSelectedId, rosIdsWithStatus, setRosIdsWithStatus] =
    useFetchRosIds(ghToken, repoInfo, fetch);

  const [ros, setRos] = useFetchRos(selectedId, ghToken, repoInfo, fetch);

  const [selectedRosStatus, setSelectedRosStatus] = useState<RosStatus | null>(
    getROSStatus(rosIdsWithStatus, selectedId),
  );

  useEffect(() => {
    setSelectedRosStatus(getROSStatus(rosIdsWithStatus, selectedId));
  }, [rosIdsWithStatus, selectedId]);

  const putROS = (updatedROS: ROS) => {
    if (repoInfo && ghToken && microsoftToken && selectedId) {
      fetch(uriToPutROS(baseUrl, repoInfo, selectedId), {
        method: 'PUT',
        headers: githubPostRequestHeaders(ghToken, microsoftToken),
        body: JSON.stringify({ ros: JSON.stringify(updatedROS) }),
      }).then(res => {
        res
          .json()
          .then(x => x as ROSProcessResultDTO)
          .then(processingResult =>
            displaySubmitResponse({
              statusMessage: processingResult.statusMessage,
              processingStatus: processingResult.status,
            }),
          );
        return null;
      });
    }
  };

  const publishROS = () => {
    if (repoInfo && ghToken && microsoftToken && selectedId) {
      fetch(uriToPublishROS(baseUrl, repoInfo, selectedId), {
        method: 'POST',
        headers: githubPostRequestHeaders(ghToken, microsoftToken),
      }).then(res => {
        res
          .json()
          .then(x => x as ROSProcessResultDTO)
          .then(processingResult =>
            displaySubmitResponse({
              statusMessage: processingResult.statusMessage,
              processingStatus: processingResult.status,
            }),
          );
        return null;
      });
    }
  };
  const createNewROS = (newRos: ROS) => {
    postROS(
      newRos,
      baseUrl,
      repoInfo,
      ghToken,
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

        displaySubmitResponse({
          statusMessage: rosProcessingResult.statusMessage,
          processingStatus: rosProcessingResult.status,
        });
        // spinn og ikke kunne redigere før her
      },
      (error: string) => {
        displaySubmitResponse({
          statusMessage: error.toString(),
          processingStatus: ROSProcessingStatus.ErrorWhenUpdatingROS,
        });
      },
      fetch,
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
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Token</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>github</th>
              <th>{ghToken}</th>
            </tr>
            <tr>
              <th>entra id</th>
              <th>{microsoftToken}</th>
            </tr>
          </tbody>
        </table>
        {rosIdsWithStatus && selectedId && (
          <Grid item xs={3}>
            <Dropdown
              label="ROS-analyser"
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
          {submitResponse && (
            <Alert
              severity={
                submitResponse.processingStatus ===
                ROSProcessingStatus.UpdatedROS
                  ? 'info'
                  : 'warning'
              }
            >
              <Typography>{submitResponse?.statusMessage}</Typography>
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
        rosIdsWithStatus={rosIdsWithStatus}
        rosStatus={selectedRosStatus}
      />
    </Content>
  );
};
