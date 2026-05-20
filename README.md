# Risk Scorecard (RiSc)

This is a plugin for Backstage that helps you and your team when working continuously with risk analysis (:).

## Frontend 
To run the frontend, you will need to have:
- A local clone of a complete Backstage app. 
- A local app-config.local.yaml file.

This RiSc plugin can then be linked to said Backstage app using `--link`.

## Using with kartverket.dev

To configure usage of this plugin with the kartverket.dev Backstage application, please utilize the startPlugin.sh bash script.

## Backend 
The plugin is dependent on a backend service in order to decrypt and communicate with GitHub, and some configuration is necessary for them to communicate. This is not included in this plugin repository, but rather as a part of kartverket.dev.

Note that it will look for a backend on localhost:8080!

Happy RiSc-ing 🌹
