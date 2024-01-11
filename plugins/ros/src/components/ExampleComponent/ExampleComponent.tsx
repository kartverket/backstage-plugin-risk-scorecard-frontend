import React, { useState } from "react";
import { Box, Button, CircularProgress, Grid, TextField, Typography } from "@material-ui/core";
import { Content, ContentHeader, Header, HeaderLabel, InfoCard, Page, SupportButton } from "@backstage/core-components";
import { fetchApiRef, githubAuthApiRef, ProfileInfo, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";

export const ExampleComponent = () => {

  const githubApi = useApi(githubAuthApiRef);
  const { value: token } = useAsync(async (): Promise<string> => githubApi.getAccessToken("repo"));
  const { value: profile } = useAsync(async (): Promise<ProfileInfo | undefined> => githubApi.getProfile());

  const [roses, setRoses] = useState<string>();

  const { fetch } = useApi(fetchApiRef);
  useAsync(
    async () => {
      if (token) {
        fetch(`http://localhost:8080/api/ros/${token}`)
          .then((response) => response.json())
          .then((json) => setRoses(json))
      }
    },
    [token]
  );

  const postROS = () => fetch(`http://localhost:8080/api/ros/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "ros": JSON.stringify(roses)})
  });

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
            <InfoCard><Typography>Heisann, {profile?.displayName ?? ""}!</Typography></InfoCard>
          </Grid>
          <Grid item>
            <Box
              display="flex"
              justifyContent="center"
            >
              {roses ?
                <TextField
                  id="filled-multiline-static"
                  hiddenLabel
                  multiline
                  fullWidth
                  defaultValue={JSON.stringify(roses, null, 2)}
                  variant="filled"
                  onChange={e => setRoses(JSON.parse(e.target.value))}
                /> :
                (
                  <Box margin="4rem">
                    <CircularProgress />
                  </Box>
                )
              }
            </Box>
          </Grid>
          <Grid item>
            <Button variant={"contained"} onClick={() => postROS()}>Send skjema</Button>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
