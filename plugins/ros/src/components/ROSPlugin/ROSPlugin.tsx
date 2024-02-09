import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
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
  useFetchRoses,
  useGithubRepositoryInformation,
  useScenarioDrawer,
} from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import { ROS } from '../interface/interfaces';

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
    selectedROS,
    setSelectedROS,
    titlesAndIds,
    selectedTitleAndId,
    selectROSByTitle,
  ] = useFetchRoses(token, repoInfo);

  const putROS = (editedRos: ROS) => {
    if (repoInfo && token && selectedTitleAndId) {
      fetch(
        `${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}/${selectedTitleAndId.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Github-Access-Token': token,
          },
          body: JSON.stringify({ ros: JSON.stringify(editedRos) }),
        },
      ).then(res => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        res.ok
          ? displaySubmitResponse('ROS ble oppdatert!')
          : res.text().then(text => displaySubmitResponse(text));
      });
    }
  };

  const postROS = (newRos: ROS) => {
    if (repoInfo && token) {
      fetch(`${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Github-Access-Token': token,
        },
        body: JSON.stringify({ ros: JSON.stringify(newRos) }),
      }).then(res => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        res.ok
          ? displaySubmitResponse('ROS ble opprettet!')
          : res.text().then(text => displaySubmitResponse(text));
      });
    }
  };

  const [scenario, setScenario, saveScenario, deleteScenario, editScenario] =
    useScenarioDrawer(selectedROS, setSelectedROS, setDrawerIsOpen, putROS);

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      <Grid container spacing={3} direction="column">
        {titlesAndIds && (
          <Grid item>
            <Dropdown
              label="ROS-analyser"
              options={titlesAndIds.map(ros => ros.tittel) ?? []}
              selectedValues={
                selectedTitleAndId?.tittel ? [selectedTitleAndId.tittel] : []
              }
              handleChange={e => selectROSByTitle(e.target.value as string)}
            />
          </Grid>
        )}

        <Grid item>
          <Button
            startIcon={<AddIcon />}
            variant="text"
            color="primary"
            onClick={() => setDialogIsOpen(true)}
          >
            Opprett ny analyse
          </Button>
        </Grid>

        {selectedROS && selectedTitleAndId && selectedROS.omfang && (
          <>
            <Grid item>
              <Typography variant="subtitle2">
                ROS-ID: {selectedTitleAndId.id}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">
                Omfang: {selectedROS.omfang}
              </Typography>
            </Grid>
          </>
        )}

        {selectedROS && (
          <Grid item>
            <ScenarioTable
              ros={selectedROS}
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
              <Typography>{submitResponse}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <ROSDialog
        isOpen={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        setRos={setSelectedROS}
        saveRos={postROS}
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
