import React, { useState } from "react";
import { Box, Button, Grid, Typography } from "@material-ui/core";
import { Content, ContentHeader, SupportButton, Table } from "@backstage/core-components";
import { fetchApiRef, githubAuthApiRef, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";
import { ROS, Scenario, TableData } from "../interface/interfaces";
import { ROSDrawer } from "../ROSDrawer/ROSDrawer";
import { mapToTableData } from "../utils/utilityfunctions";
import { columns } from "../utils/columns";

export const ROSPlugin = () => {

  const { fetch } = useApi(fetchApiRef);
  const githubApi = useApi(githubAuthApiRef);

  const { value: token } = useAsync(async (): Promise<string> => githubApi.getAccessToken("repo"));

  const [roses, setRoses] = useState<ROS>({
    versjon: "1.0",
    skjema_versjon: "1.0",
    ID: "1",
    scenarier: []
  });
  const [response, setResponse] = useState<string>();
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [tableData, setTableData] = useState<TableData[]>([]);

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/${token}`)
        .then(res => res.json())
        .then(json => json as ROS)
        .then(ros => setRoses(ros));
    }
  }, [token]);

  useAsync(async () => {
    setTableData(mapToTableData(roses));
  }, [roses]);

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

  const lagreNyttScenario = (scenario: Scenario) => {
    setRoses({
      ...roses,
      scenarier: roses.scenarier.concat(scenario)
    });
  };



  return (
    <Content>
      <ContentHeader title="Risiko- og sårbarhetsanalyse">
        <SupportButton>Kul plugin ass!</SupportButton>
      </ContentHeader>

      <Grid container spacing={3} direction="column">

        <Grid item>
          <Table
            options={{ paging: false }}
            data={tableData}
            columns={columns}
            isLoading={!roses}
            title="Risikoscenarioer"
          />
        </Grid>

        <Grid item>
          <Grid container direction="row">

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setDrawerIsOpen(true)}
              >
                Legg til nytt risikoscenario
              </Button>
            </Grid>

            <Grid item>
              <Box display="flex" alignItems="center" gridGap="2rem">
                <Button variant="contained" onClick={() => postROS()}>
                  Send risiko- og sårbarhetsanalyse
                </Button>
                <Typography>{response}</Typography>
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
