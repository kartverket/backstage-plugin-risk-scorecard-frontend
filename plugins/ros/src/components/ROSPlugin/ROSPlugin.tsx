import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
  Table,
} from '@backstage/core-components';
import {
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { Scenario } from '../interface/interfaces';
import { ROSDrawer } from '../ROSDrawer/ROSDrawer';
import { columns } from '../utils/columns';
import { Dropdown } from '../ROSDrawer/Dropdown';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { mapToTableData } from '../utils/utilityfunctions';
import {
  useBaseUrl,
  useFetchRos,
  useFetchRosIds,
  useGithubRepositoryInformation,
} from '../utils/hooks';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const baseUrl = useBaseUrl();
  const { value: token } = useAsync(() => githubApi.getAccessToken('repo'));

  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
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
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Github-Access-Token': token,
          },
          body: JSON.stringify({ ros: JSON.stringify(ros) }),
        },
      ).then(res => {
        if (res.ok) {
          setSaveROSResponse('Ny ROS ble lagret!');
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

  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      <Grid container spacing={3} direction="column">
        <Grid item>
          <Dropdown
            label="ROS-analyser"
            options={rosIds ?? []}
            selectedValues={selectedId ? [selectedId] : []}
            handleChange={e => setSelectedId(e.target.value as string)}
          />
        </Grid>

        <Grid item>
          {ros && (
            <Table
              options={{ paging: false }}
              data={ros ? mapToTableData(ros) : []}
              columns={columns}
              isLoading={!ros}
              title="Scenarioer"
            />
          )}
        </Grid>

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

      <ROSDrawer
        isOpen={drawerIsOpen}
        setIsOpen={setDrawerIsOpen}
        lagreNyttScenario={lagreNyttScenario}
      />
    </Content>
  );
};
