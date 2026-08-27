# Risk Scorecard / Operasjonell risiko og sårbarhetsanalyse (OpRoS)

This repository contains the frontend plugin for Backstage used to work with risk analysis.

In order to run you will need to have:

- A local clone of `kartverket.dev` as a sibling, i.e. `../kartverket.dev`
- A correctly set up `../kartverket.dev/app-config.local.yaml` file based on `../kartverket.dev/app-config.example.yaml` with secrets.

To start kartverket.dev with the local version of the plugin use `yarn kartverket.dev`.

For instructions on how to publish new releases, versioning and viewing the test checklist, see [CONTRIBUTING.md](./CONTRIBUTING.md#versioning)

## Backend

The plugin uses a Kotlin backend which can be found here [backstage-plugin-risk-scorecard-backend](https://github.com/kartverket/backstage-plugin-risk-scorecard-backend). It handles RiSc CRUD operations, SOPS encryption/decryption, GitHub PR lifecycle, and GCP KMS integration.
