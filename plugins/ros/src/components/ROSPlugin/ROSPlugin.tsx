import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
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
import { ROS, Scenario } from '../interface/interfaces';
import { ROSDrawer } from '../ROSDrawer/ROSDrawer';
import { Dropdown } from '../ROSDrawer/Dropdown';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import {
  useBaseUrl,
  useFetchRos,
  useFetchRosIds,
  useGithubRepositoryInformation,
} from '../utils/hooks';
import { ScenarioTable } from '../Table/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const [saveROSResponse, setSaveROSResponse] = useState<string>('');

  const currentEntity = useAsyncEntity();
  const repoInformation = useGithubRepositoryInformation(currentEntity);
  const [rosIds, selectedId, setSelectedId] = useFetchRosIds(
    token,
    repoInformation,
  );
  const [ros, setRos] = useFetchRos(selectedId, token, repoInformation);

  const postROS = () => {
    if (repoInformation && token) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selectedId}`,
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
          setSaveROSResponse('ROS ble oppdatert!');
        } else {
          res.text().then(text => setSaveROSResponse(text));
        }
      });
    }
  };

  const lagreNyttScenario = (scenario: Scenario) => {
    if (ros) {
      setRos({
        ...ros,
        scenarier: ros.scenarier.concat(scenario),
      });
    }
  };

  const createNewROS = (newRos: ROS) => {
    setRos(newRos);
  };

  const slettScenario = (index: number) => {
    if (ros) {
      setRos({
        ...ros,
        // scenarier: ros.scenarier.filter(scenario => scenario.id !== id),
        scenarier: ros.scenarier.filter((_, i) => i !== index),
      });
    }
  };

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
              deleteRow={slettScenario}
              editRow={id => console.log(`Endret ${id}`)}
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
              <Box display="flex" alignItems="center" gridGap="2rem">
                <Button
                  style={{ textTransform: 'none' }}
                  variant="contained"
                  onClick={postROS}
                >
                  Send risiko- og sårbarhetsanalyse
                </Button>
                <Typography>{saveROSResponse}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <ROSDialog
        isOpen={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        createNewROS={createNewROS}
      />

      <ROSDrawer
        isOpen={drawerIsOpen}
        setIsOpen={setDrawerIsOpen}
        lagreNyttScenario={lagreNyttScenario}
      />
    </Content>
  );
};
