# Risk Scorecard / Operasjonell risiko og sårbarhetsanalyse (OpRoS)

This repository contains the frontend plugin for Backstage used to work with risk analysis.

In order to run you will need to have:

- A local clone of `kartverket.dev` as a sibling, i.e. `../kartverket.dev`
- A correctly set up `../kartverket.dev/app-config.local.yaml` file based on `../kartverket.dev/app-config.example.yaml` with secrets.

To start kartverket.dev with the local version of the plugin use `yarn kartverket.dev`.

For instructions on how to publish new releases, versioning and viewing the test checklist, see [CONTRIBUTING.md](./CONTRIBUTING.md#versioning)

## Backend

The plugin currently uses a Kotlin backend which can be found here [backstage-plugin-risk-scorecard-backend](https://github.com/kartverket/backstage-plugin-risk-scorecard-backend)

However work has started on replacing it with a Backstage backend plugin, found in `plugins/ros-backend`. It handles the same responsibilites of the Kotlin kackend: RiSc CRUD operations, SOPS encryption/decryption, GitHub PR lifecycle, and GCP KMS integration. See this [README](plugins/ros-backend/README.md) for further instructions on how to use it.
