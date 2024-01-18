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
  InfoCard,
  SupportButton,
  Table,
} from '@backstage/core-components';
import {
  fetchApiRef,
  githubAuthApiRef,
  ProfileInfo,
  useApi,
} from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { ROS, TableData } from '../interface/interfaces';
import { mapToTableData } from '../utils/utilityfunctions';
import { columns } from '../utils/columns';

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { value: token } = useAsync(
    async (): Promise<string> => githubApi.getAccessToken('repo'),
  );
  const { value: profile } = useAsync(
    async (): Promise<ProfileInfo | undefined> => githubApi.getProfile(),
  );

  const [roses, setRoses] = useState<ROS>();
  const [response, setResponse] = useState<string>();
  const [tableData, setTableData] = useState<TableData[]>([]);

  const { fetch } = useApi(fetchApiRef);

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/${token}`)
        .then(res => res.json())
        .then(json => json as ROS)
        .then(ros => {
          setRoses(ros);
          setTableData(mapToTableData(ros));
        });
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

  return (
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
          {tableData.length > 0 ? (
            <Table
              options={{ paging: false }}
              data={tableData}
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
                defaultValue={JSON.stringify(roses.scenarier, null, 2)}
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
  );
};
