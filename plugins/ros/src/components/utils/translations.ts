import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const pluginTranslationRef = createTranslationRef({
  id: 'plugin.ros',
  messages: {
    contentHeader: {
      title: 'Risiko- og sårbarhetsanalyse',
    },
    dictionary: {
      cancel: 'Avbryt',
      close: 'Lukk',
      save: 'Lagre',
      edit: 'Rediger',
      scope: 'Omfang',
      title: 'Tittel',
      risk: 'Risiko',
      initialRisk: 'Startrisiko',
      restRisk: 'Restrisiko',
      estimatedRisk: 'Estimert risiko',
      consequence: 'Konsekvens',
      probability: 'Sannsynlighet',
      description: 'Beskrivelse',
      threatActors: 'Trusselaktører',
      vulnerabilities: 'Sårbarheter',
    },
    createNewButton: 'Opprett ny analyse',
    rosInfo: {
      statusBox: {
        status: {
          missing: 'Mangler godkjenning av risikoeier',
          approved: 'Godkjent av risikoeier',
          error: 'Kunne ikke hente status',
        },
        prStatus: 'Avventer godkjenning av PR',
        approveButton: 'Godkjenn ROS',
      },
    },
    scenarioTable: {
      title: 'Risikoscenarioer',
      addScenarioButton: 'Legg til risikoscenario',
      columns: {
        measuresCount: 'Antall tiltak',
        consequenceChar: 'K',
        probabilityChar: 'S',
        completed: 'fullførte',
      },
    },
    riskMatrix: {
      title: 'Risikomatrise',
      estimatedRisk: {
        title: 'Estimert risiko',
        suffix: {
          thousand: 'tusen',
          million: 'million',
          millions: 'millioner',
          billion: 'milliard',
          billions: 'milliarder',
          trillion: 'billion',
          trillions: 'billioner',
        },
        unit: {
          nokPerYear: 'kr / år',
        },
      },
      tooltip: {
        title: 'Risikoscenarioer',
      },
    },
    infoDialog: {
      title: 'Estimert risiko',
      description:
        'Den estimerte risikoen er basert på hvor stor risiko de forskjellige\n' +
        'scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig\n' +
        'konsekvens skjer er det høy risiko for at det kan bli en stor\n' +
        'kostnad for Kartverket. Kostnaden er m.a.o. et forsøk på å\n' +
        'konkretisere verdien av risiko og er summen av den estimerte\n' +
        'risikoen for alle risikoscenariene i denne ROS-analysen.',
      calculatedHowTitle: 'Hvordan regner vi ut estimert risiko?',
      calculatedHow:
        'Konsekvensen måles i kroner per hendelse og sannsynlighet måles i\n' +
        'hendelser per år. Den estimerte risikoen blir da: K x S.',
      consequenceTitle: 'Konsekvens (kr/hendelse)',
      probabilityTitle: 'Sannsynlighet (hendelser/år)',
      probabilityDescription: {
        0: 'ca hvert 100. år',
        1: 'ca hvert 10. år',
        2: 'ca årlig',
        3: 'ca ukentlig',
        4: 'ca daglig',
      },
      example:
        'Et risikoscenario med konsekvens 2 og sannsynlighet 4 har en\n' +
        'estimert risiko på 30 000 kr/hendelse x 50 hendelser/år = 1 500 000\n' +
        'kr/år.',
    },
    rosDialog: {
      titleNew: 'Ny risiko- og sårbarhetsanalyse',
      titleEdit: 'Rediger ROS-analyse',
      titleError: 'ROS-analysen må ha en tittel',
      scopeDescription:
        'Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres.',
      scopeError: 'ROS-analysen må ha et omfang',
    },
    scenarioDrawer: {
      title: 'Risikoscenario',
    },
  },
});
