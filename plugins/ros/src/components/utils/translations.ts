import {createTranslationRef, createTranslationResource} from '@backstage/core-plugin-api/alpha';

export const pluginTranslationRef = createTranslationRef({
  id: 'plugin.ros',
  messages: {
    contentHeader: {
      title: 'Risk score card',
      createNewButton: 'Create new score card',
    },
    dictionary: {
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      consequence: 'Consequence', // Severity, Impact, Effect or Consequence
      deadline: 'Deadline', // Deadline or Due date
      delete: 'Delete',
      description: 'Description',
      discardChanges: 'Discard changes',
      edit: 'Edit',
      estimatedRisk: 'Estimated risk',
      initialRisk: 'Initial risk', // Starting risk or Initial risk
      measure: 'Measure', // Measure, Action or Initiative
      measureOwner: 'Responsible', // Responsible? Measure owner? Initiative owner?
      probability: 'Probability', // Likelihood or Probability
      restRisk: 'Remaining risk', // Residual or Remaining risk
      risk: 'Risk',
      save: 'Save',
      scope: 'Scope',
      status: 'Status',
      threatActors: 'Threat actors',
      title: 'Title',
      vulnerabilities: 'Vulnerabilities',
    },
    rosStatus: {
      statusBadge: {
        // Approve/Approval eller Accept/Acceptance?? (Approval brukes i Github så kanskje fint å skille)
        missing: 'Risk owner acceptance missing', // Mangler godkjenning av risikoeier
        approved: 'Accepted by risk owner', // Godkjent av risikoeier
        error: 'Failed to retrieve status', // Kunne ikke hente status
      },
      prStatus: 'Awaiting PR approval', // Avventer godkjenning av PR
      approveButton: 'Accept risks', // Godkjenn ROS
    },
    publishDialog: {
      title: 'Accept risks', // Godkjenn ROS
      checkboxLabel:
        'I confirm that I am the risk owner and accept the risks in this risk score card.',
      // Jeg bekrefter at jeg er risikoeier og godtar risikoen i denne risiko- og sårbarhetsanalysen.
    },
    scenarioTable: {
      title: 'Risk scenarios',
      addScenarioButton: 'Add risk scenario',
      columns: {
        measuresCount: 'Number of measures',
        consequenceChar: 'C',
        probabilityChar: 'P',
        completed: 'completed',
      },
    },
    riskMatrix: {
      title: 'Risk matrix', // Risk matrix or Risk overview
      estimatedRisk: {
        title: 'Estimated risk',
        suffix: {
          thousand: '{{count}} thousand',
          million_one: '{{count}} million',
          million_other: '{{count}} million',
          billion_one: '{{count}} billion',
          billion_other: '{{count}} billion',
          trillion_one: '{{count}} trillion',
          trillion_other: '{{count}} trillion',
        },
        unit: {
          nokPerYear: 'NOK/year',
        },
      },
      tooltip: {
        title: 'Risk scenarios',
      },
    },
    infoDialog: {
      title: 'Estimated risk',
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
      titleNew: 'New risk score card', // Ny risiko- og sårbarhetsanalyse
      titleEdit: 'Edit risk score card', // Rediger ROS-analyse
      titleError: 'The score card must have a title', // TODO
      scopeDescription:
        'Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres.',
      scopeError: 'The score card must have a description of the scope', // TODO
    },
    scenarioDrawer: {
      title: 'Risk scenario',
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
          'Hvilke tiltak burde gjøres for å unngå scenarioet?',
        measureOwnerDescription:
          'De eller den som er ansvarlig for at tiltaket blir gjennomført',
        addMeasureButton: 'Add measure',
        existingMeasure: 'Eksisterende tiltak',
        existingMeasureSubtitle: 'Kort beskrivelse av relevante tiltak som allerede har blitt gjennomført',
      },
      restRiskTab: {
        subtitle:
          'Sett restrisiko for scenarioet. Restrisiko er konsekvens og sannsynlighet for' +
          'scenarioet etter at alle tiltak i listen er gjennomført.',
      },
      deleteScenarioButton: 'Delete scenario',
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
          '4': 'Varige eller alvorlige helsemessige konsekvenser',
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
        '5': 'Svært stor',
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

export const pluginRiScNorwegianTranslation = createTranslationResource({
  ref: pluginTranslationRef,
  translations: {
    no: () =>
      Promise.resolve({
        default: {
          'contentHeader.title': 'Risiko- og sårbarhetsanalyse',
          'contentHeader.createNewButton': 'Opprett ny analyse',
          'dictionary.cancel': 'Avbryt',
          'dictionary.close': 'Lukk',
          'dictionary.confirm': 'Bekreft',
          'dictionary.consequence': 'Konsekvens',
          'dictionary.deadline': 'Frist',
          'dictionary.delete': 'Slett',
          'dictionary.description': 'Beskrivelse',
          'dictionary.discardChanges': 'Forkast endringer',
          'dictionary.edit': 'Rediger',
          'dictionary.estimatedRisk': 'Estimert risiko',
          'dictionary.initialRisk': 'Startrisiko',
          'dictionary.measure': 'Tiltak',
          'dictionary.measureOwner': 'Tiltakseier',
          'dictionary.probability': 'Sannsynlighet',
          'dictionary.restRisk': 'Restrisiko',
          'dictionary.risk': 'Risiko',
          'dictionary.save': 'Lagre',
          'dictionary.scope': 'Omfang',
          'dictionary.status': 'Status',
          'dictionary.threatActors': 'Trusselaktører',
          'dictionary.title': 'Tittel',
          'dictionary.vulnerabilities': 'Sårbarheter',
          'rosStatus.statusBadge.missing': 'Mangler godkjenning',
          'rosStatus.statusBadge.approved': 'Godkjent av risikoeier',
          'rosStatus.statusBadge.error': 'Kunne ikke hente status',
          'rosStatus.prStatus': 'Avventer godkjenning av PR',
          'rosStatus.approveButton': 'Godkjenn ROS',
          'publishDialog.title': 'Godkjenn ROS',
          'publishDialog.checkboxLabel': 'Jeg bekrefter at jeg er risikoeier og godtar risikoen i denne risiko- og sårbarhetsanalysen.',
          'scenarioTable.title': 'Risikoscenarioer',
          'scenarioTable.addScenarioButton': 'Legg til risikoscenario',
          'scenarioTable.columns.measuresCount': 'Antall tiltak',
          'scenarioTable.columns.consequenceChar': 'K',
          'scenarioTable.columns.probabilityChar': 'S',
          'scenarioTable.columns.completed': 'fullførte',
          'riskMatrix.title': 'Risikomatrise',
          'riskMatrix.estimatedRisk.title': 'Estimert risiko',
          'riskMatrix.estimatedRisk.suffix.thousand': '{{count}} tusen',
          'riskMatrix.estimatedRisk.suffix.million_one': '{{count}} million',
          'riskMatrix.estimatedRisk.suffix.million_other': '{{count}} millioner',
          'riskMatrix.estimatedRisk.suffix.billion_one': '{{count}} milliard',
          'riskMatrix.estimatedRisk.suffix.billion_other': '{{count}} milliarder',
          'riskMatrix.estimatedRisk.suffix.trillion_one': '{{count}} billion',
          'riskMatrix.estimatedRisk.suffix.trillion_other': '{{count}} billioner',
          'riskMatrix.estimatedRisk.unit.nokPerYear': 'kr / år',
          'riskMatrix.tooltip.title': 'Risikoscenarioer',
          'infoDialog.title': 'Estimert risiko',
          'infoDialog.description': 'Den estimerte risikoen er basert på hvor stor risiko de forskjellige scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig konsekvens skjer er det høy risiko for at det kan bli en stor kostnad for Kartverket. Kostnaden er m.a.o. et forsøk på å konkretisere verdien av risiko og er summen av den estimerte risikoen for alle risikoscenariene i denne ROS-analysen.',
          'infoDialog.calculatedHowTitle': 'Hvordan regner vi ut estimert risiko?',
          'infoDialog.calculatedHow': 'Konsekvensen måles i kroner per hendelse og sannsynlighet måles i hendelser per år. Den estimerte risikoen blir da: K x S.',
          'infoDialog.consequenceTitle': 'Konsekvens (kr/hendelse)',
          'infoDialog.probabilityTitle': 'Sannsynlighet (hendelser/år)',
          'infoDialog.probabilityDescription.0': 'ca hvert 100. år',
          'infoDialog.probabilityDescription.1': 'ca hvert 10. år',
          'infoDialog.probabilityDescription.2': 'ca årlig',
          'infoDialog.probabilityDescription.3': 'ca ukentlig',
          'infoDialog.probabilityDescription.4': 'ca daglig',
          'infoDialog.example': 'Et risikoscenario med konsekvens 2 og sannsynlighet 4 har en estimert risiko på 30 000 kr / hendelse x 50 hendelser / år = 1 500 000 kr/år.',
          'rosDialog.titleNew': 'Ny risiko- og sårbarhetsanalyse',
          'rosDialog.titleEdit': 'Rediger ROS-analyse',
          'rosDialog.titleError': 'ROS-analysen må ha en tittel',
          'rosDialog.scopeDescription': 'Hva risikoanalysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres.',
          'rosDialog.scopeError': 'ROS-analysen må ha et omfang',
          'scenarioDrawer.title': 'Risikoscenario',
          'scenarioDrawer.subtitle': 'En uønsket hendelse som potensielt kan ramme systemet',
          'scenarioDrawer.threatActorSubtitle': 'Aktøren som prøver å få tilgang til eller misbruke systemet',
          'scenarioDrawer.vulnerabilitySubtitle': 'Svakhet i systemet som kan utnyttes av trusselaktøren',
          'scenarioDrawer.consequenceTab.subtitle': 'Hvor alvorlig er den potensielle konsekvensen i det relevante området? Hvis konsekvensen er relevant for flere områder gjelder det høyeste konsekvensnivået.',
          'scenarioDrawer.probabilityTab.subtitle': 'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme. Dersom du er mellom to sannsynlighetsverdier velger du den høyeste.',
          'scenarioDrawer.measureTab.subtitle': 'Hvilke tiltak burde gjøres for å unngå scenarioet?',
          'scenarioDrawer.measureTab.measureOwnerDescription': 'De eller den som er ansvarlig for at tiltaket blir gjennomført',
          'scenarioDrawer.measureTab.addMeasureButton': 'Legg til tiltak',
          'scenarioDrawer.measureTab.existingMeasure': 'Eksisterende tiltak',
          'scenarioDrawer.measureTab.existingMeasureSubtitle': 'Kort beskrivelse av relevante tiltak som allerede har blitt gjennomført',
          'scenarioDrawer.restRiskTab.subtitle': 'Sett restrisiko for scenarioet. Restrisiko er konsekvens og sannsynlighet for scenarioet etter at alle tiltak i listen er gjennomført.',
          'scenarioDrawer.deleteScenarioButton': 'Slett scenario',
          'scenarioDrawer.deleteScenarioConfirmation': 'Er du sikker på at du vil slette scenario?',
          'scenarioDrawer.closeConfirmation': 'Vil du lagre endringene dine?',
          'consequenceTable.rows.1': 'Ubetydelig',
          'consequenceTable.rows.2': 'Liten',
          'consequenceTable.rows.3': 'Moderat',
          'consequenceTable.rows.4': 'Alvorlig',
          'consequenceTable.rows.5': 'Kritisk',
          'consequenceTable.columns.health': 'Liv og helse',
          'consequenceTable.columns.economical': 'Økonomisk',
          'consequenceTable.columns.privacy': 'Personvern',
          'consequenceTable.columns.reputation': 'Omdømme og tillit',
          'consequenceTable.cells.health.1': 'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.2': 'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.3': 'Midlertidig eller mindre alvorlige helsemessige konsekvenser',
          'consequenceTable.cells.health.4': 'Varige eller alvorlige helsemessige konsekvenser',
          'consequenceTable.cells.health.5': 'Død eller varige alvorlige helsemssige konsekvenser',
          'consequenceTable.cells.economical.1': 'Forbigående mindre økonomisk tap',
          'consequenceTable.cells.economical.2': 'Forbigående økonomisk tap',
          'consequenceTable.cells.economical.3': 'Økonomisk tap av noe varighet',
          'consequenceTable.cells.economical.4': 'Økonomisk tap av betydelig varighet for Kartverket og evt. tredjeparter',
          'consequenceTable.cells.economical.5': 'Varig og alvorlig økonomisk tap',
          'consequenceTable.cells.privacy.1': 'Retten til personvern utfordres i en svært kort periode og involverer ikke særlige kategorier/sårbare grupper',
          'consequenceTable.cells.privacy.2': 'Retten til personvern krenkes i en lengre periode eller involverer særlige kategorier/sårbare grupper',
          'consequenceTable.cells.privacy.3': 'Retten til personvern krenkes alvorlig i en lengre periode og involverer særlige kategorier/sårbare grupper',
          'consequenceTable.cells.privacy.4': 'Retten til personvern krenkes på en svært alvorlig måte',
          'consequenceTable.cells.privacy.5': 'Personvern kan ikke være mer alvorlig enn 4',
          'consequenceTable.cells.reputation.1': 'Midlertidig omdømmetap og liten innvirkning på tillit',
          'consequenceTable.cells.reputation.2': 'Negative saker i nasjonale medier som kan redusere tillit',
          'consequenceTable.cells.reputation.3': 'Varig negativ oppmerksomhet i nasjonale og internasjonale medier som kan redusere tillit',
          'consequenceTable.cells.reputation.4': 'Omdømme og tillit kan ikke være mer alvorlig enn 3',
          'consequenceTable.cells.reputation.5': 'Omdømme og tillit kan ikke være mer alvorlig enn 3',
          'probabilityTable.rows.1': 'Svært liten',
          'probabilityTable.rows.2': 'Liten',
          'probabilityTable.rows.3': 'Moderat',
          'probabilityTable.rows.4': 'Stor',
          'probabilityTable.rows.5': 'Svært stor',
          'probabilityTable.cells.1': 'Scenarioet er usannsynlig å inntreffe. Det inntreffer sjeldnere enn hvert 100. år',
          'probabilityTable.cells.2': 'Scenarioet er lite sannsynlig å inntreffe. Det kan inntreffe hvert 10. år',
          'probabilityTable.cells.3': 'Scenarioet kan inntreffe. Det kan inntreffe nærmest årlig',
          'probabilityTable.cells.4': 'Scenarioet vil med stor sannsynlighet inntreffe. Det kan inntreffe nærmest ukentlig',
          'probabilityTable.cells.5': 'Scenarioet er nesten garantert å inntreffe. Det kan inntreffe nærmest daglig',
        },
    })
  }
});