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
	kartverket_atlassian_net__write_ros_locally: 'https://kartverket.atlassian.net/wiki/spaces/SIK/pages/1472528509/Skrive+koden+r+RoS+lokalt',
	
	github_com__kartverket_changelog: "https://github.com/kartverket/backstage-plugin-risk-scorecard-backend/blob/main/docs/schemaChangelog.md",

	www_googleapis_com__cloudkms: 'https://www.googleapis.com/auth/cloudkms',
	www_googleapis_com__cloud_platform: 'https://www.googleapis.com/auth/cloud-platform',
	www_googleapis_com__cloudplatformprojects_readonly: 'https://www.googleapis.com/auth/cloudplatformprojects.readonly',
};
