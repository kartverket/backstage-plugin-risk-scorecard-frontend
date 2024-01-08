import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Content, ContentHeader, Header, HeaderLabel, InfoCard, Page, Progress, SupportButton } from "@backstage/core-components";
import { fetchApiRef, identityApiRef, ProfileInfo, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";
import { Table } from "@backstage/core-components";

export const ExampleComponent = () => {
  const { fetch } = useApi(fetchApiRef);
  const {  value: data, loading } = useAsync(async (): Promise<String> => fetch("http://localhost:8080/api/helloworld").then((response) => response.text()));

  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async (): Promise<ProfileInfo> => identityApi.getProfileInfo());

  const username = user?.displayName
  if (loading) return <Progress />;
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
            <InfoCard><Typography>Heisann, {username ?? ""}!</Typography></InfoCard>
          </Grid>
          <Grid item>
            <InfoCard title="Message from backend">
              <Typography variant="body1">
                {data ?? "Loading..."}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item>
            <Table
              columns={[
                { title: "Col 1" },
                { title: "Col 2" }
              ]}
              data={[

              ]}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
