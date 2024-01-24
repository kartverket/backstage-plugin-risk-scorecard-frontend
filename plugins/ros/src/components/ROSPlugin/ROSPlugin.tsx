import React, { useState } from "react";
import { Box, Button, Grid, Typography } from "@material-ui/core";
import { Content, ContentHeader, SupportButton, Table } from "@backstage/core-components";
import { fetchApiRef, githubAuthApiRef, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";
import { ROS, Scenario, TableData } from "../interface/interfaces";
import { ROSDrawer } from "../ROSDrawer/ROSDrawer";
import { mapToTableData } from "../utils/utilityfunctions";
import { columns } from "../utils/columns";
import { Dropdown } from "../ROSDrawer/Dropdown";

export const ROSPlugin = () => {
  const githubApi = useApi(githubAuthApiRef);
  const { fetch } = useApi(fetchApiRef);

  const { value: token } = useAsync(async (): Promise<string> => githubApi.getAccessToken("repo"));

  const [ros, setRos] = useState<ROS>();
  const [saveROSResponse, setSaveROSResponse] = useState<string>("");
  const [tableData, setTableData] = useState<TableData[]>();
  const [idItems, setIdItems] = useState<{ label: string; value: string }[]>();
  const [selected, setSelected] = useState<string>();
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  useAsync(async () => {
    if (token) {
      fetch(`http://localhost:8080/api/ros/ids/${token}`)
        .then(res => res.json())
        .then(json => json as string[])
        .then(ids => {
          const newIdItems = ids.map(id => ({
            label: id,
            value: id
          }));
          setIdItems(newIdItems);
        });
    }
  }, [token]);

  useAsync(async () => {
    if (selected && token) {
      fetch(`http://localhost:8080/api/ros/single/${selected}/${token}`)
        .then(res => res.json())
        .then(json => json as ROS)
        .then(ros => {
          setTableData(mapToTableData(ros));
          setRos(ros);
        });
    }
  }, [selected, token]);

  const postROS = () =>
    fetch(`http://localhost:8080/api/ros/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ros: JSON.stringify(ros) })
    }).then(res => {
      if (res.ok) {
        setSaveROSResponse("Ny ROS ble lagret!");
      } else {
        res.text().then(text => setSaveROSResponse(text));
      }
    });

  const lagreNyttScenario = (scenario: Scenario) => {
    if (ros) {
      setRos({
        ...ros,
        scenarier: ros.scenarier.concat(scenario)
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
            selected={selected ? [selected] : []}
            handleChange={e => setSelected(e.target.value as string)}
          />
        </Grid>

        <Grid item>
          <Table
            options={{ paging: false }}
            data={tableData ?? []}
            columns={columns}
            isLoading={!tableData}
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
