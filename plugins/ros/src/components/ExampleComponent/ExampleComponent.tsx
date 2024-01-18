import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  fetchApiRef,
  githubAuthApiRef,
  ProfileInfo,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const ExampleComponent = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { value: token } = useAsync(
    async (): Promise<string> => githubApi.getAccessToken('repo'),
  );
  const { value: profile } = useAsync(
    async (): Promise<ProfileInfo | undefined> => githubApi.getProfile(),
  );

  const [roses, setRoses] = useState<string>();
  const [response, setResponse] = useState<string>();

  const [rawResponse, setRawResponse] = useState<RawResponse>();
  const [mappedRos, setMappedRos] = useState<TableData[]>([]);

  const { fetch } = useApi(fetchApiRef);

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/${token}`)
        .then(res => res.json())
        .then(json => setRoses(json));
    }
  }, [token]);

  const postROS = () =>
    fetch(`http://localhost:8080/api/ros/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ros: JSON.stringify(roses) }),
    }).then(res => {
      if (res.ok) {
        setResponse('Ny ROS ble lagret!');
      } else {
        res.text().then(text => setResponse(text));
      }
    });

  const mapResponseToTableData = (data: RawResponse) => {
    const tableData: TableData[] = [];
    data.scenarier.forEach(scenario => {
      const scenarioKey = Object.keys(scenario)[0];
      const scenarioData = scenario[scenarioKey];

      const riskData = scenarioData.risiko;
      const risk: Risk = {
        probability: riskData.sannsynlighet,
        consequence: riskData.konsekvens,
      };

      const tableRow: TableData = {
        description: scenarioData.beskrivelse,
        threat: scenarioData.trusselaktører
          ? scenarioData.trusselaktører[0]
          : '',
        vulnerability: scenarioData.sårbarheter
          ? scenarioData.sårbarheter[0]
          : '',
        consequence: risk.consequence,
        probability: risk.probability,
      };

      tableData.push(tableRow);
    }, setMappedRos(tableData));
  };

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/${token}`)
        .then(res => res.json())
        .then(json => {
          setRawResponse(json);
          mapResponseToTableData(json);
        })
        .catch(error => {
          // Handle errors here
          console.error('Error fetching data:', error);
        });
    }
  }, [token]);

  interface RawResponse {
    versjon: string;
    verdivurderinger: any[];
    scenarier: any[];
  }

  interface TableData {
    description: string;
    threat: string;
    vulnerability: string;
    consequence: number;
    probability: number;
  }

  interface Risk {
    probability: number;
    consequence: number;
  }

  const columns: TableColumn[] = [
    {
      title: 'Beskrivelse',
      field: 'description',
      highlight: true,
      type: 'string',
    },
    {
      title: 'Trusselaktør',
      field: 'threat',
      type: 'string',
    },
    {
      title: 'Sårbarhet',
      field: 'vulnerability',
      type: 'string',
    },
    {
      title: 'Konsekvens',
      field: 'consequence',
      type: 'numeric',
    },
    {
      title: 'Sannsynlighet',
      field: 'probability',
      type: 'numeric',
    },
  ];

  return (
    <Page themeId="tool">
      <Header title="Welcome to ros!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Risiko- og sikkerhetsanalyse">
          <SupportButton>Kul plugin ass!</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard>
              <Typography>Heisann, {profile?.displayName ?? ''}!</Typography>
            </InfoCard>
          </Grid>
          <Grid item>
            {mappedRos.length > 0 ? (
              <Table
                options={{ paging: false }}
                data={mappedRos}
                columns={columns}
                title="Backstage Table"
              />
            ) : (
              <Box margin="4rem">
                <CircularProgress />
              </Box>
            )}
          </Grid>
          <Grid item>
            <Box display="flex" justifyContent="center">
              {roses ? (
                <TextField
                  id="filled-multiline-static"
                  hiddenLabel
                  multiline
                  fullWidth
                  defaultValue={JSON.stringify(roses, null, 2)}
                  variant="filled"
                  onChange={e => setRoses(JSON.parse(e.target.value))}
                />
              ) : (
                <Box margin="4rem">
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center" gridGap="2rem">
              <Button variant="contained" onClick={() => postROS()}>
                Send skjema
              </Button>
              <Typography>{response}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
