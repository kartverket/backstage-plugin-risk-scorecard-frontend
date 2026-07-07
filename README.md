# Risk Scorecard (RiSc / Risiko- og Sårbarhetsanalyse - RoS)

These are plugins (backend and frontend) for Backstage that help you and your team when working continuously with risk analysis.

To run you will need to have:

- A local clone of `kartverket.dev` as a sibling, i.e. `../kartverket.dev`
- A correctly set up `../kartverket.dev/app-config.local.yaml` file based on `../kartverket.dev/app-config.example.yaml` with secrets inserted from 1Password.

To start kartverket.dev with the local version of these plugins please utilize `yarn kartverket.dev`.

## Backend

The `ros-backend` package in this repo is the Backstage backend plugin. It handles RiSc CRUD operations, SOPS encryption/decryption, GitHub PR lifecycle, and GCP KMS integration.

Happy RiSc-ing 🌹
