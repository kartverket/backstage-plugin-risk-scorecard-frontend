import { ExplorePage } from '@backstage-community/plugin-explore';
import { TechRadarPage } from '@backstage-community/plugin-tech-radar';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import {
  configApiRef,
  microsoftAuthApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { DevToolsPage } from '@backstage/plugin-devtools';
import { HomepageCompositionRoot, VisitListener } from '@backstage/plugin-home';
import { orgPlugin } from '@backstage/plugin-org';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { SearchPage } from '@backstage/plugin-search';
import {
  DefaultTechDocsHome,
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { OpencostPage } from '@kartverket/backstage-plugin-opencost';
import { pluginRiScNorwegianTranslation } from '@kartverket/backstage-plugin-risk-scorecard';
import { Route } from 'react-router-dom';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { HomePage } from './components/home/HomePage';
import { URLS } from './urls';

const app = createApp({
  __experimentalTranslations: {
    availableLanguages: ['en', 'no'],
    resources: [pluginRiScNorwegianTranslation],
  },
  components: {
    SignInPage: props => {
      const configApi = useApi(configApiRef);
      if (configApi.getOptionalString('auth.environment') !== 'production') {
        return (
          <SignInPage
            {...props}
            auto
            providers={[
              'guest',
              {
                id: 'microsoft-auth-provider',
                title: 'Microsoft',
                message: 'Sign in using Microsoft',
                apiRef: microsoftAuthApiRef,
              },
            ]}
          />
        );
      }
      return (
        <SignInPage
          {...props}
          auto
          provider={{
            id: 'microsoft-auth-provider',
            title: 'Microsoft',
            message: 'Sign in using Microsoft',
            apiRef: microsoftAuthApiRef,
          }}
        />
      );
    },
  },
  apis,
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

const routes = (
  <FlatRoutes>
    <Route path={URLS.frontend.index} element={<HomepageCompositionRoot />}>
      <HomePage />
    </Route>
    <Route path={URLS.frontend.catalog} element={<CatalogIndexPage />} />
    <Route path={URLS.frontend.catalog_entity} element={<CatalogEntityPage />}>
      {entityPage}
    </Route>
    <Route path={URLS.frontend.docs} element={<TechDocsIndexPage />}>
      <DefaultTechDocsHome />
    </Route>
    <Route
      path={URLS.frontend.tech_docs_reader_page}
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path={URLS.frontend.create} element={<ScaffolderPage />} />
    <Route path={URLS.frontend.api_docs} element={<ApiExplorerPage />} />
    <Route
      path={URLS.frontend.tech_radar}
      element={<TechRadarPage width={1500} height={800} />}
    />
    <Route
      path={URLS.frontend.catalog_import}
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path={URLS.frontend.settings} element={<UserSettingsPage />} />
    <Route path={URLS.frontend.catalog_graph} element={<CatalogGraphPage />} />
    <Route path={URLS.frontend.explore} element={<ExplorePage />} />
    <Route path={URLS.frontend.devtools} element={<DevToolsPage />} />
    <Route path={URLS.frontend.opencost} element={<OpencostPage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <VisitListener />
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
