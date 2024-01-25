import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
  Table,
} from '@backstage/core-components';
import {
  configApiRef,
  fetchApiRef,
  githubAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ROS, Scenario, TableData } from '../interface/interfaces';
import { ROSDrawer } from '../ROSDrawer/ROSDrawer';
import { columns } from '../utils/columns';
import { Dropdown } from '../ROSDrawer/Dropdown';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { mapToTableData } from '../utils/utilityfunctions';

interface GithubRepositoryInformation {
  name: string;
  owner: string;
}

interface RosId {
  label: string;
  value: string;
}

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const { value: token } = useAsync(
    async (): Promise<string> => githubApi.getAccessToken('repo'),
  );

  const currentEntity = useAsyncEntity();
  const [repoInformation, setRepoInformation] =
    useState<GithubRepositoryInformation | null>(null);

  useEffect(() => {
    if (!currentEntity.loading && currentEntity.entity !== undefined) {
      const slug =
        currentEntity.entity.metadata.annotations !== undefined
          ? currentEntity.entity.metadata.annotations[
              'github.com/project-slug'
            ].split('/')
          : null;

      if (slug === null) return;

      setRepoInformation({
        name: slug[1],
        owner: slug[0],
      });
    }
  }, [currentEntity.entity, currentEntity.loading]);

  const config = useApi(configApiRef);
  const baseUrl = config.getString('app.backendUrl');

  const [ros, setRos] = useState<ROS>();
  const [saveROSResponse, setSaveROSResponse] = useState<string>('');
  const [tableData, setTableData] = useState<TableData[]>();
  const [idItems, setIdItems] = useState<RosId[]>();
  const [selected, setSelected] = useState<string>();
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  useAsync(async () => {
    if (token && repoInformation) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/ids`,
        {
          headers: { 'Github-Access-Token': token },
        },
      )
        .then(res => res.json())
        .then(json => json as string[])
        .then(ids => {
          const newIdItems: RosId[] = ids.map(id => ({
            label: id,
            value: id,
          }));
          setIdItems(newIdItems);
        });
    }
  }, [token]);

  useAsync(async () => {
    if (selected && token && repoInformation) {
      fetch(
        `${baseUrl}/api/ros/${repoInformation.owner}/${repoInformation.name}/${selected}`,
        {
          headers: { 'Github-Access-Token': token },
        },
      )
        .then(res => res.json())
        .then(json => json as ROS)
        .then(fetchedRos => {
          setTableData(mapToTableData(fetchedRos));
          setRos(fetchedRos);
        });
    }
  }, [selected, token]);

  const postROS = (repoOwner: String, repoName: String) =>
    fetch(`${baseUrl}/api/ros/${repoOwner}/${repoName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Github-Access-Token': token!!,
      },
      body: JSON.stringify({ ros: JSON.stringify(ros) }),
    }).then(res => {
      if (res.ok) {
        setSaveROSResponse('Ny ROS ble lagret!');
      } else {
        res.text().then(text => setSaveROSResponse(text));
      }
    });

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
            options={idItems?.map(i => i.value) ?? []}
            selectedValues={selected ? [selected] : []}
            handleChange={e => setSelected(e.target.value as string)}
          />
        </Grid>

        <Grid item>
          <Table
            options={{ paging: false }}
            data={tableData ?? []}
            columns={columns}
            isLoading={!tableData}
            title="Scenarioer"
          />
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
                  onClick={() =>
                    repoInformation !== null
                      ? postROS(repoInformation?.owner, repoInformation?.name)
                      : ''
                  }
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
