import React, { useState } from "react";
import { Box, Button, CircularProgress, Grid, TextField, Typography } from "@material-ui/core";
import { Content, ContentHeader, InfoCard, SupportButton } from "@backstage/core-components";
import { fetchApiRef, githubAuthApiRef, ProfileInfo, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";
import { ROS } from "../interface/interfaces";
import { ROSDrawer } from "../ROSDrawer/ROSDrawer";

export const ROSPlugin = () => {

  const { fetch } = useApi(fetchApiRef);
  const githubApi = useApi(githubAuthApiRef);

  const { value: token } = useAsync(async (): Promise<string> => githubApi.getAccessToken("repo"));
  const { value: profile } = useAsync(async (): Promise<ProfileInfo | undefined> => githubApi.getProfile());

  const [roses, setRoses] = useState<ROS>();
  const [response, setResponse] = useState<string>();
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/${token}`)
        .then(res => res.json())
        .then(json => json as ROS)
        .then(ros => setRoses(ros));
    }
  }, [token]);

  const postROS = () =>
    fetch(`http://localhost:8080/api/ros/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ros: JSON.stringify(roses) })
    }).then(res => {
      if (res.ok) {
        setResponse("Ny ROS ble lagret!");
      } else {
        res.text().then(text => setResponse(text));
      }
    });

  return (
    <Content>
      <ContentHeader title="Risiko- og sikkerhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setDrawerIsOpen(true)}
      >
        Lag ny ROS
      </Button>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <Typography>Heisann, {profile?.displayName ?? ""}!</Typography>
          </InfoCard>
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
      <ROSDrawer isOpen={drawerIsOpen} setIsOpen={setDrawerIsOpen} />
    </Content>
  );
};
