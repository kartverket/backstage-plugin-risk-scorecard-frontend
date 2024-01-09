import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@material-ui/core";
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
  Table
} from "@backstage/core-components";
import { fetchApiRef, githubAuthApiRef, ProfileInfo, useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/lib/useAsync";

export const ExampleComponent = () => {

  const githubApi = useApi(githubAuthApiRef);
  const { value: token } = useAsync(async (): Promise<string> => githubApi.getAccessToken("repo"));
  const { value: profile } = useAsync(async (): Promise<ProfileInfo | undefined> => githubApi.getProfile());

  const { fetch } = useApi(fetchApiRef);
  const [roses, setRoses] = useState<string[]>();

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:8080/api/github/${token}`)
        .then((response) => response.json())
        .then((data) => setRoses(data));
    }
  }, [token]);

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
            <InfoCard><Typography>
              <pre>{JSON.stringify(roses, null, 2) ?? ""}</pre>
            </Typography></InfoCard>
          </Grid>
          <Grid item>
            <Table
              columns={[
                { title: "Col 1" },
                { title: "Col 2" }
              ]}
              data={[]}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
