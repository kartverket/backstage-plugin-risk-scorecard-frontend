import React, { useState } from 'react';
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
  useFetchRoses,
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
    selectedROS,
    setSelectedROS,
    titlesAndIds,
    setTitlesAndIds,
    selectedTitleAndId,
    selectROSByTitle,
  ] = useFetchRoses(token, repoInfo);

  const putROS = (updatedROS: ROS) => {
    if (repoInfo && token && selectedTitleAndId) {
      fetch(uriToPutROS(baseUrl, repoInfo, selectedTitleAndId.id), {
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
    if (repoInfo && token && selectedTitleAndId) {
      fetch(uriToPublishROS(baseUrl, repoInfo, selectedTitleAndId.id), {
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
        const newRosIdWithDraftStatus = {
          id: rosProcessingResult.rosId,
          tittel: rosProcessingResult.tittel,
          status: RosStatus.Draft,
        };
        const updatedRosIdsWithStatus = titlesAndIds
          ? [...titlesAndIds, newRosIdWithDraftStatus]
          : [newRosIdWithDraftStatus];

        setTitlesAndIds(updatedRosIdsWithStatus);
        setSelectedROS(newRos);
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
  } = useScenarioDrawer(selectedROS, setSelectedROS, setDrawerIsOpen, putROS);

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        {titlesAndIds && (
          <Grid item xs={3}>
            <Dropdown
              label="ROS-analyser"
              options={titlesAndIds.map(ros => ros.tittel) ?? []}
              selectedValues={
                selectedTitleAndId?.tittel ? [selectedTitleAndId.tittel] : []
              }
              handleChange={e => selectROSByTitle(e.target.value as string)}
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

        {selectedTitleAndId && selectedROS && selectedROS.omfang && (
          <>
            <Grid item container direction="row">
              <Grid item container xs direction="column" spacing={0}>
                <Grid item xs>
                  <Typography variant="subtitle2">
                    ROS-ID: {selectedTitleAndId.id}
                  </Typography>
                </Grid>

                <Grid item xs>
                  <Typography variant="subtitle2">
                    Omfang: {selectedROS.omfang}
                  </Typography>
                </Grid>
              </Grid>
              <ROSStatusComponent
                currentROSId={selectedTitleAndId.id}
                currentRosStatus={selectedTitleAndId.status}
                publishRosFn={publishROS}
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
          <Typography>{submitResponse}</Typography>
        </Grid>
      </Grid>

      {/* --- Popups --- */}

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
          currentROSId={selectedTitleAndId.id}
          rosIdsWithStatus={titlesAndIds}
          rosStatus={selectedTitleAndId.status}
        />
      )}
    </Content>
  );
};
