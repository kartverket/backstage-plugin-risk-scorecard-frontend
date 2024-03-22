# [Backstage](https://backstage.io)

For å kjøre backstage lokalt, kjør:

```sh
yarn install
yarn dev
```

### Docker

For å bygge docker-image, kjør:

```sh
docker image build -t backstage .
```

For å kjøre docker-image, kjør:

```sh
docker run -it -p 3000:7007 \
-e GITHUB_APP_ID=${GITHUB_APP_ID} \
-e GITHUB_APP_CLIENT_ID=${GITHUB_APP_CLIENT_ID} \
-e GITHUB_APP_CLIENT_SECRET=${GITHUB_APP_CLIENT_SECRET} \
-e GITHUB_APP_PK=${GITHUB_APP_CLIENT_PK} \
-e AZURE_TENANT_ID=${AZURE_TENANT_ID} \
-e AZURE_CLIENT_ID=${AZURE_CLIENT_ID} \
-e AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \ 
-e GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
-e GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
backstage
```

# Spire ROS Catalog

Katalogen med entiteter som er satt opp for dette prosjektet henter:

## Discovery av komponenter

Komponenter (kind: Component) hentes fra Github, hvor det er satt opp discovery mot
organisasjonen ["spire-test"](https://github.com/spire-test). Her hentes all informasjon fra repositories definert
i ```catalog.providers.github``` i ```app-config.yaml```.

Sånn ser en eksempelvis (og den vi bruker) config av github-discovery ut. Her henter vi alle entiteter fra repoer som
starter på kv-ros, fra main-branchen, og leter etter definisjon i filen ```.security/catalog-info.yaml```.
For å ta i bruk dette, legges det til en ``entityProvider`` i ```catalog.ts```.

```yaml
    github:
      spire-test:
        organization: 'spire-test'
        catalogPath: '.security/catalog-info.yaml'
        filters:
          branch: 'main'
          repository: '^kv-ros-.*$'
        schedule:
          frequency: { minutes: 1440 }
          timeout: { minutes: 3 }
```

Om du vil legge til flere, kan du se på [denne](https://backstage.io/docs/integrations/github/discovery) dokumentasjonen
for github, eller sjekke ut de andre integrasjonene som finnes fra før (eller lage egne ☺️).

## Discovery av organisasjonsdata

Vi henter informasjon om brukere fra to forskjellige steder: github og microsoft.
Settes opp på den samme måten som discovery av komponenter, hvor man definerer konfigurasjon i ```app-config.yaml```, og
legger til entityProvider i ```catalog.ts```.

En ting å tenke på: Discovery kan være ganske treigt når det er utrolig mange brukere, grupper og entiteter. Vi har
derfor prøvd å begrense hva vi trenger når vi har testet, for at det skal ta kortest mulig tid å spinne opp miljøet.

# Spire ROS Autentisering av brukere

Vi har satt opp innlogging med tre forskjellige providers: Entra ID, GCP og Github.
Konfigurasjon av autentisering skjer i ```auth.providers```, taes i bruk i ```auth.ts``` og kan settes opp med så mange
providers man kunne ønske seg.

Når man har lagt til innlogging med en provider, har man også mulighet til å ta i bruk ```*authApiRef``` for den gitte
provideren. Da får man tilgang på bla. id-tokens og access-tokens. Om en bruker ikke er logget inn med provideren du vil
ha tilgang til tokens for, blir en bruker togglet med innoggings-skjerm for den du ønsker automatisk ved å bruke disse
api-ene. Sjekk ut ```hooks.ts``` for å sjekke ut hvordan man kan bruke dem.

## Entra ID

Entra ID er satt til å logge inn med Bekk-kontoen din, og fordi vi har satt opp discovery av organisasjonsdata med
Bekk-organisasjonen vil session knyttes til denne.

[Her](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/4db9a5d4-74c3-4c7e-bd71-1029f96a099c/isMSAApp~/false)
kan du finne "App Registraton" for Entra ID consent-screen/innlogging.

### Hva brukes egentlig dette til?

Entra-brukeren brukes til å gjøre autorisering av brukeren i backend-appen ved hjelp av et id-token.
Validering av token gjør også at vi prøver å issue et access token via en Github App, sånn at brukere uten github-bruker
også kan nå dokumentene.

## GCP

Google brukes for å kunne bruke den innlogga brukeren sine permissions i GCP hvor nøkkelringene er lagret i KMSen. På
den måten får man ikke tilgang til mer enn man skal.

[Her](https://console.cloud.google.com/apis/credentials/consent?referrer=search&project=spire-ros-5lmr) kan du finne
OAuth Consent Screen, som man bruker for å logge seg inn med GCP.

Obs. husk å legge til brukere som kan ta del av testingen her.

## Github

Github-innlogging brukes per nå ikke til noe spesielt i selve ros-as-code, men tanken er å ha noe av den samme løsningen
som med gcp. Om man har en github-bruker og er logget inn, kan man bruke brukerens egne permissions i github.

[Her](https://github.com/organizations/spire-test/settings/installations) kan du finne appene som brukes. Vi har en for
devmiljø/lokalt og en for "produksjon".

- [Nåværende test-app](https://github.com/organizations/spire-test/settings/apps/backstage-ros)
- [Nåværende prod-app](https://github.com/organizations/spire-test/settings/apps/backstage-testis)

# Secrets

[Her](https://console.cloud.google.com/security/secret-manager?project=spire-ros-5lmr) ligger secrets som brukes i
Backstage.

# Bygge Plugin-pakke

```sh
cd plugins/ros
yarn install
yarn tsc
yarn build
yarn publish # husk å sette ny versjon
```