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
import { ROSProcessResultDTO } from '../utils/types';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const repoInfo = useGithubRepositoryInformation();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const [submitResponse, displaySubmitResponse] = useDisplaySubmitResponse();

  const [rosIds, selectedId, setSelectedId, rosIdsWithStatus] = useFetchRosIds(
    token,
    repoInfo,
  );
  const [ros, setRos] = useFetchRos(selectedId, token, repoInfo);

  const putROS = (ros: ROS) => {
    if (repoInfo && token) {
      fetch(
        `${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}/${selectedId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Github-Access-Token': token,
          },
          body: JSON.stringify({ ros: JSON.stringify(ros) }),
        },
      ).then(res => {
        if (res.ok) {
          displaySubmitResponse('ROS ble oppdatert!');
        } else {
          res.text().then(text => displaySubmitResponse(text));
        }
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
      })
        .then(res => {
          if (res.ok) {
            displaySubmitResponse('ROS ble opprettet!');
            return res.json();
          }
          res.text().then(text => displaySubmitResponse(text));
          return null;
        })
        .then(json => json as ROSProcessResultDTO)
        .then(processingResult => {
          console.log(processingResult);
        });
    }
  };

  const publishROS = () => {
    if (repoInfo && token) {
      fetch(
        `${baseUrl}/api/ros/${repoInfo.owner}/${repoInfo.name}/publish/${selectedId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Github-Access-Token': token,
          },
        },
      ).then(res => {
        if (res.ok) {
          displaySubmitResponse('Det ble opprettet en PR for ROSen!');
        } else {
          res.text().then(text => displaySubmitResponse(text));
        }
      });
    }
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
                  'Draft' && (
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
