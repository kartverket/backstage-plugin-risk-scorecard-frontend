import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const pluginTranslationRef = createTranslationRef({
  id: 'plugin.ros',
  messages: {
    contentHeader: {
      title: 'Risiko- og sårbarhetsanalyse',
      createNewButton: 'Opprett ny analyse',
    },
    dictionary: {
      cancel: 'Avbryt',
      close: 'Lukk',
      confirm: 'Bekreft',
      consequence: 'Konsekvens',
      deadline: 'Frist',
      delete: 'Slett',
      description: 'Beskrivelse',
      discardChanges: 'Forkast endringer',
      edit: 'Rediger',
      estimatedRisk: 'Estimert risiko',
      initialRisk: 'Startrisiko',
      measure: 'Tiltak',
      measureOwner: 'Tiltakseier',
      probability: 'Sannsynlighet',
      restRisk: 'Restrisiko',
      risk: 'Risiko',
      save: 'Lagre',
      scope: 'Omfang',
      status: 'Status',
      threatActors: 'Trusselaktører',
      title: 'Tittel',
      vulnerabilities: 'Sårbarheter',
    },
    rosStatus: {
      statusBadge: {
        missing: 'Mangler godkjenning av risikoeier',
        approved: 'Godkjent av risikoeier',
        error: 'Kunne ikke hente status',
      },
      prStatus: 'Avventer godkjenning av PR',
      approveButton: 'Godkjenn ROS',
    },
    publishDialog: {
      title: 'Godkjenn ROS',
      checkboxLabel:
        'Jeg bekrefter at jeg er risikoeier og godtar risikoen i denne risiko- og sårbarhetsanalysen.',
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
          thousand: '{{count}} tusen',
          million_one: '{{count}} million',
          million_other: '{{count}} millioner',
          billion_one: '{{count}} milliard',
          billion_other: '{{count}} milliarder',
          trillion_one: '{{count}} billion',
          trillion_other: '{{count}} billioner',
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
        'Den estimerte risikoen er basert på hvor stor risiko de forskjellige' +
        'scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig' +
        'konsekvens skjer er det høy risiko for at det kan bli en stor' +
        'kostnad for Kartverket. Kostnaden er m.a.o. et forsøk på å' +
        'konkretisere verdien av risiko og er summen av den estimerte' +
        'risikoen for alle risikoscenariene i denne ROS-analysen.',
      calculatedHowTitle: 'Hvordan regner vi ut estimert risiko?',
      calculatedHow:
        'Konsekvensen måles i kroner per hendelse og sannsynlighet måles i hendelser per år.' +
        'Den estimerte risikoen blir da: K x S.',
      consequenceTitle: 'Konsekvens (kr/hendelse)',
      probabilityTitle: 'Sannsynlighet (hendelser/år)',
      probabilityDescription: {
        '0': 'ca hvert 100. år',
        '1': 'ca hvert 10. år',
        '2': 'ca årlig',
        '3': 'ca ukentlig',
        '4': 'ca daglig',
      },
      example:
        'Et risikoscenario med konsekvens 2 og sannsynlighet 4 har en estimert risiko på' +
        '30 000 kr / hendelse x 50 hendelser / år = 1 500 000 kr/år.',
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
      subtitle: 'En uønsket hendelse som potensielt kan ramme systemet',
      threatActorSubtitle:
        'Aktøren som prøver å få tilgang til eller misbruke systemet',
      vulnerabilitySubtitle:
        'Svakhet i systemet som kan utnyttes av trusselaktøren',
      consequenceTab: {
        subtitle:
          'Hvor alvorlig er den potensielle konsekvensen i det relevante området?' +
          'Hvis konsekvensen er relevant for flere områder gjelder det høyeste konsekvensnivået.',
      },
      probabilityTab: {
        subtitle:
          'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme.' +
          'Dersom du er mellom to sannsynlighetsverdier velger du den høyeste.',
      },
      measureTab: {
        subtitle:
          'Hvilke tiltak som kan gjøres for å unngå den uønskede hendelsen',
        measureOwnerDescription:
          'De eller den som er ansvarlig for at tiltaket blir gjennomført',
        addMeasureButton: 'Legg til tiltak',
      },
      restRiskTab: {
        subtitle:
          'Sett restrisiko for scenarioet. Restrisiko er konsekvens og sannsynlighet for' +
          'scenarioet etter at alle tiltak i listen er gjennomført.',
      },
      deleteScenarioButton: 'Slett scenario',
      deleteScenarioConfirmation: 'Er du sikker på at du vil slette scenario?',
      closeConfirmation: 'Vil du lagre endringene dine?',
    },
    consequenceTable: {
      rows: {
        '1': 'Ubetydelig',
        '2': 'Liten',
        '3': 'Moderat',
        '4': 'Alvorlig',
        '5': 'Kritisk',
      },
      columns: {
        health: 'Liv og helse',
        economical: 'Økonomisk',
        privacy: 'Personvern',
        reputation: 'Omdømme og tillit',
      },
      cells: {
        health: {
          '1': 'Liv og helse kan ikke være mindre alvorlig enn 3',
          '2': 'Liv og helse kan ikke være mindre alvorlig enn 3',
          '3': 'Midlertidig eller mindre alvorlige helsemessige konsekvenser',
          '4': 'Varig eller alvorlig helsemessige konsekvenser',
          '5': 'Død eller varige alvorlige helsemssige konsekvenser',
        },
        economical: {
          '1': 'Forbigående mindre økonomisk tap',
          '2': 'Forbigående økonomisk tap',
          '3': 'Økonomisk tap av noe varighet',
          '4': 'Økonomisk tap av betydelig varighet for Kartverket og evt. tredjeparter',
          '5': 'Varig og alvorlig økonomisk tap',
        },
        privacy: {
          '1': 'Retten til personvern utfordres i en svært kort periode og involverer ikke særlige kategorier/sårbare grupper',
          '2': 'Retten til personvern krenkes i en lengre periode eller involverer særlige kategorier/sårbare grupper',
          '3': 'Retten til personvern krenkes alvorlig i en lengre periode og involverer særlige kategorier/sårbare grupper',
          '4': 'Retten til personvern krenkes på en svært alvorlig måte',
          '5': 'Personvern kan ikke være mer alvorlig enn 4',
        },
        reputation: {
          '1': 'Midlertidig omdømmetap og liten innvirkning på tillit',
          '2': 'Negative saker i nasjonale medier som kan redusere tillit',
          '3': 'Varig negativ oppmerksomhet i nasjonale og internasjonale medier som kan redusere tillit',
          '4': 'Omdømme og tillit kan ikke være mer alvorlig enn 3',
          '5': 'Omdømme og tillit kan ikke være mer alvorlig enn 3',
        },
      },
    },
    probabilityTable: {
      rows: {
        '1': 'Svært liten',
        '2': 'Liten',
        '3': 'Moderat',
        '4': 'Stor',
        '5': 'Svært liten',
      },
      cells: {
        '1': 'Scenarioet er usannsynlig å inntreffe. Det inntreffer sjeldnere enn hvert 100. år',
        '2': 'Scenarioet er lite sannsynlig å inntreffe. Det kan inntreffe hvert 10. år',
        '3': 'Scenarioet kan inntreffe. Det kan inntreffe nærmest årlig',
        '4': 'Scenarioet vil med stor sannsynlighet inntreffe. Det kan inntreffe nærmest ukentlig',
        '5': 'Scenarioet er nesten garantert å inntreffe. Det kan inntreffe nærmest daglig',
      },
    },
  },
});
