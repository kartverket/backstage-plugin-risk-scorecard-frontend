# Risk Scorecard / Operasjonell risiko og sårbarhetsanalyse (OpRoS)

These are plugins (backend and frontend) for Backstage that help you and your team when working continuously with risk analysis.

To run you will need to have:

- A local clone of `kartverket.dev` as a sibling, i.e. `../kartverket.dev`
- A correctly set up `../kartverket.dev/app-config.local.yaml` file based on `../kartverket.dev/app-config.example.yaml` with secrets.

To start kartverket.dev with the local version of these plugins utilize `yarn kartverket.dev`.

## Backend

The plugin currently uses a Kotlin backend which can be found here [backstage-plugin-risk-scorecard-backend](https://github.com/kartverket/backstage-plugin-risk-scorecard-backend)

However work has started on replacing it with a Backstage backend plugin, which can be found in `plugins/ros-backend`. It handles the responsibilites of the Kotlin kackend: RiSc CRUD operations, SOPS encryption/decryption, GitHub PR lifecycle, and GCP KMS integration.
