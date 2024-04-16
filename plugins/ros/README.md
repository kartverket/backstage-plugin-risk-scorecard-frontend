# RiSc

This is a plugin for Backstage that helps you and your team when working continuously with your risk analyses (:))
The plugin is dependent on a backend service in order to decrypt and communicate with GitHub, and some configuration is
necessary for them to communicate.

Add the root url to your running backend service to the app-config:

``` yaml
app:
  backendUrl: http://localhost:8080
```

The backend uses EntraID id-tokens to validate the user, and GCP access tokens to federate access to the GCP KMS.
The plugin uses the apiRefs for both of these providers, and entity providers and authentication have to be implemented
for both:

1. Add discovery of organization data for Microsoft Org
2. Add authentication for both providers

Happy RiSc-ing 🌹