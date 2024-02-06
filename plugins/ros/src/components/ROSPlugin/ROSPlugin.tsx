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
import { Dropdown } from '../ScenarioDrawer/Dropdown';
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
import { RESTMethods } from 'msw';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const repoInfo = useGithubRepositoryInformation();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

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

  const putROS = (updatedROS: ROS) => {
    if (repoInfo && token) {
      fetch(uriToPutROS(baseUrl, repoInfo, token), {
        method: RESTMethods.PUT,
        headers: githubPostRequestHeaders(token),
        body: JSON.stringify({ ros: JSON.stringify(updatedROS) }),
      }).then(res => {
        if (res.ok) displaySubmitResponse('ROS ble oppdatert!');
        else res.text().then(text => displaySubmitResponse(text));
      });
    }
  };

  const publishROS = () => {
    if (repoInfo && token) {
      fetch(uriToPublishROS(baseUrl, repoInfo, token), {
        method: RESTMethods.POST,
        headers: githubPostRequestHeaders(token),
      }).then(res => {
        if (res.ok) {
          // TODO: update to senttoapproval
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

  const [scenario, setScenario, saveScenario, deleteScenario, editScenario] =
    useScenarioDrawer(ros, setRos, setDrawerIsOpen, putROS);

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      <Grid container spacing={3} direction="column">
        {selectedId && (
          <Grid item>
            <Dropdown
              label="ROS-analyser"
              options={rosIds ?? []}
              selectedValues={selectedId ? [selectedId] : []}
              handleChange={e => setSelectedId(e.target.value as string)}
            />
            {rosIdsWithStatus
              ? `(${
                  rosIdsWithStatus.filter(x => x.id === selectedId)[0].status
                })`
              : ''}
          </Grid>
        )}

        <Grid item>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            variant="text"
            color="primary"
            onClick={() => setDialogIsOpen(true)}
          >
            Opprett ny analyse
          </Button>
        </Grid>

        {/* TODO: Håndetering av tidligere skjemaer */}
        {ros && ros.tittel && ros.omfang && (
          <>
            <Grid item>
              <Typography variant="subtitle2"> Tittel: {ros.tittel}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">Omfang: {ros.omfang}</Typography>
            </Grid>
          </>
        )}

        {ros && (
          <Grid item>
            <ScenarioTable
              ros={ros}
              deleteRow={deleteScenario}
              editRow={editScenario}
            />
          </Grid>
        )}

        <Grid item>
          <Grid container direction="row">
            <Grid item>
              <Button
                style={{ textTransform: 'none' }}
                variant="contained"
                color="primary"
                onClick={() => setDrawerIsOpen(true)}
              >
                Legg til nytt scenario
              </Button>
            </Grid>

            <Grid item>
              {rosIdsWithStatus &&
                selectedId &&
                rosIdsWithStatus.filter(x => x.id === selectedId)[0].status ===
                  RosStatus.Draft && (
                  <Button
                    style={{ textTransform: 'none' }}
                    variant="contained"
                    color="primary"
                    onClick={() => (ros !== undefined ? publishROS() : '')}
                  >
                    Send til godkjenning (publisér)
                  </Button>
                )}
            </Grid>

            <Grid item>
              <Typography>{submitResponse}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <ROSDialog
        isOpen={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
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
    </Content>
  );
};
