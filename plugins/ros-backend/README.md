# Backstage Backend Plugin

This directory contains Backstage plugin which aims to be a replacement for the Kotlin backend. It handles the same responsibilites of the Kotlin kackend: RiSc CRUD operations, SOPS encryption/decryption, GitHub PR lifecycle, and GCP KMS integration. It is currently under development and is not ready for production.

## Local Development

> Make sure the following changes is not commited to main

1. Navigate to the **kartverket.dev** repository

2. In `packages/app/backend`, replace `@kartverket/backstage-plugin-risk-scorecard-backend` with the following:

```
"@kartverket/backstage-plugin-risk-scorecard-backend": "portal:../../../backstage-plugin-risk-scorecard-frontend/plugins/ros-backend"
```

3. Run `yarn install` in kartverket.dev

kartverket.dev will now use the local backend found in this repository under `plugins/ros-backend`
