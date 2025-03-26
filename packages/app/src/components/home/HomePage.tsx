import React from 'react';
import {
  HomePageCompanyLogo,
  HomePageRecentlyVisited,
  HomePageToolkit,
  HomePageTopVisited,
} from '@backstage/plugin-home';
import { Content, Page } from '@backstage/core-components';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Grid, makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import LogoFull from '../Root/LogoFull';
import grafanaLogo from './logos/Grafana.png';
import argoLogo from './logos/Argo.png';
import sysdigLogo from './logos/Sysdig.png';
import googleCloudLogo from './logos/GoogleCloud.png';
import googleLogo from './logos/Google.png';
import databricksLogo from './logos/Databricks.png';
import githubLogo from './logos/Github.png';
import daskLogo from './logos/DASK.png';
import skipLogo from './logos/SKIP.png';
import { URLS } from '../../urls';

const useStyles = makeStyles(theme => ({
  searchBarInput: {
    maxWidth: '60vw',
    margin: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50px',
    boxShadow: theme.shadows[1],
  },
  searchBarOutline: {
    borderStyle: 'none',
  },
}));

const useLogoStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(0, 5),
    width: '100%',
    maxWidth: 600,
  },
  svg: {
    width: '100%',
    height: 'auto',
  },
  path: {
    fill: '#7df3e1',
  },
}));

export const HomePage = () => {
  const classes = useStyles();

  const { svg, path, container } = useLogoStyles();
  const theme = useTheme();
  const mode = theme.palette.type === 'dark' ? 'light' : 'dark';

  return (
    <SearchContextProvider>
      <Page themeId="home">
        <Content>
          <Grid container justifyContent="center" spacing={6}>
            <HomePageCompanyLogo
              className={container}
              logo={<LogoFull type={mode} className={`${svg} ${path}`} />}
            />
            <Grid container item xs={12} justifyContent="center">
              <HomePageSearchBar
                InputProps={{
                  classes: {
                    root: classes.searchBarInput,
                    notchedOutline: classes.searchBarOutline,
                  },
                }}
                placeholder="Search"
              />
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={12} md={6}>
                <HomePageRecentlyVisited />
              </Grid>
              <Grid item xs={12} md={6}>
                <HomePageTopVisited />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <HomePageToolkit
                tools={[
                  {
                    url: URLS.external.monitorering_kartverket_cloud,
                    label: 'Grafana',
                    icon: (
                      <img src={grafanaLogo} alt="Logo of Grafana" width={35} />
                    ),
                  },
                  {
                    url: URLS.external.argo_kartverket_dev,
                    label: 'Argo CD',
                    icon: (
                      <img src={argoLogo} alt="Logo of Argo CD" width={45} />
                    ),
                  },
                  {
                    url: URLS.external.eu1_app_sysdig_com__saml_kartverket,
                    label: 'Sysdig Secure',
                    icon: (
                      <img src={sysdigLogo} alt="Logo of Sysdig" width={40} />
                    ),
                  },
                  {
                    url: URLS.external.accounts_gcp_databricks_com,
                    label: 'Databricks',
                    icon: (
                      <img
                        src={databricksLogo}
                        alt="Logo of Databricks"
                        width={35}
                      />
                    ),
                  },
                  {
                    url: URLS.external.console_cloud_google_com,
                    label: 'Google Cloud',
                    icon: (
                      <img
                        src={googleCloudLogo}
                        alt="Logo of Google"
                        width={35}
                      />
                    ),
                  },
                  {
                    url: URLS.external.github_com__kartverket,
                    label: 'GitHub',
                    icon: (
                      <img src={githubLogo} alt="Logo of GitHub" width={35} />
                    ),
                  },
                  {
                    url: URLS.external.jit_skip_kartverket_no,
                    label: 'JIT',
                    icon: (
                      <img src={googleLogo} alt="Logo of Google" width={35} />
                    ),
                  },
                  {
                    url: URLS.external.kartverket_atlassian_net__dask_docs,
                    label: 'DASK Docs',
                    icon: <img src={daskLogo} alt="Logo of DASK" width={35} />,
                  },
                  {
                    url: URLS.external.skip_kartverket_no__skip_docs,
                    label: 'SKIP Docs',
                    icon: <img src={skipLogo} alt="Logo of SKIP" width={35} />,
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Content>
      </Page>
    </SearchContextProvider>
  );
};
