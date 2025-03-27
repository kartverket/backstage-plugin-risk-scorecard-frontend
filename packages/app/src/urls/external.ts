// prettier-ignore

/**
 * Group of all external or other urls referenced in the project.
 *
 * Conventions:
 * 1. Separate domain from endpoint with double underscore.
 * Example:
 * `https://kartverket.atlassian.net/some/endpoint -> kartverket__atlassian_net__some_endpoint`
 *
 * 2. Include entire domain in the name.
 */
export const EXTERNAL_URLS = {
  eu_posthog_com: 'https://eu.posthog.com',
  backstage_io__annotations: 'https://backstage.io/docs/features/software-catalog/well-known-annotations',
  monitorering_kartverket_cloud: 'https://monitoring.kartverket.cloud',
  argo_kartverket_dev: 'https://argo.kartverket.dev',
  eu1_app_sysdig_com__saml_kartverket: 'https://eu1.app.sysdig.com/api/saml/kartverket?redirectRoute=/&product=SDS&companyName=kartverket',
  accounts_gcp_databricks_com:'https://accounts.gcp.databricks.com',
  console_cloud_google_com: 'https://console.cloud.google.com',
  github_com__kartverket: 'https://github.com/kartverket',
  jit_skip_kartverket_no: 'https://jit.skip.kartverket.no',
  kartverket_atlassian_net__dask_docs: 'https://kartverket.atlassian.net/wiki/spaces/DAT/overview?homepageId=490045441',
  skip_kartverket_no__skip_docs: 'https://skip.kartverket.no/docs',
};
