import {
  createTranslationRef,
  createTranslationResource,
} from '@backstage/core-plugin-api/alpha';

export const pluginRiScTranslationRef = createTranslationRef({
  id: 'plugin.riSc',
  messages: {
    contentHeader: {
      title: 'Risk scorecard',
      createNewButton: 'Create new scorecard',
    },
    dictionary: {
      cancel: 'Cancel',
      close: 'Close',
      completed: 'Completed',
      confirm: 'Confirm',
      consequence: 'Consequence', // Severity, Impact, Effect or Consequence
      deadline: 'Deadline', // Deadline or Due date
      delete: 'Delete',
      description: 'Description',
      discardChanges: 'Discard changes',
      edit: 'Edit',
      estimatedRisk: 'Estimated risk',
      initialRisk: 'Initial risk', // Starting or Initial risk
      measure: 'Action', // Measure, Action or Initiative
      measureOwner: 'Responsible', // Responsible? Measure owner? Initiative owner?
      next: 'Next',
      planned: 'Planned',
      previous: 'Previous',
      probability: 'Probability', // Likelihood or Probability
      restRisk: 'Remaining risk', // Residual or Remaining risk
      risk: 'Risk',
      save: 'Save',
      saveAndClose: 'Save and close',
      saveError: 'Could not save scenario. Please try again.',
      scenario: 'Scenario',
      scope: 'Scope',
      status: 'Status',
      threatActors: 'Threat actors',
      title: 'Title',
      url: 'URL',
      emptyUrl: 'No URL specified',
      vulnerabilities: 'Vulnerabilities',
    },
    rosStatus: {
      statusBadge: {
        missing: 'Awaiting acceptance from risk owner', // Mangler godkjenning av risikoeier
        approved: 'Accepted by risk owner', // Godkjent av risikoeier
        error: 'Failed to retrieve status', // Kunne ikke hente status
      },
      prStatus: ' Pending pull request in ', // Avventer godkjenning av PR i Github
      approveButton: 'Accept risks', // Godkjenn ROS
    },
    publishDialog: {
      title: 'Accept risks', // Godkjenn ROS
      checkboxLabel:
        'I confirm that I am the risk owner and accept the risks detailed in this risk scorecard.',
    },
    scenarioTable: {
      title: 'Risk scenarios',
      addScenarioButton: 'Add scenario',
      columns: {
        measuresCount: 'Actions',
        consequenceChar: 'C',
        probabilityChar: 'P',
        completed: 'complete',
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
        'The estimated risk is a calculation based on the risks the different scenarios pose. If there is a high probability that a serious consequence will occur, this could potentially become a large cost for the organization. In other words, the cost is an attempt to make the risk value more tangible and is the sum of the estimated risk for all the risk scenarios in this risk scorecard.',
      calculatedHowTitle: 'How do we calculate the estimated risk?',
      calculatedHow:
        'Consequence is measured in cost (in NOK) per incident and probability is measured in incidents per year. ' +
        'The estimated risk is calculated as C x P.',
      consequenceTitle: 'Consequence (NOK/incident)', // incident, event or occurrence
      probabilityTitle: 'Probability (incidents/year)',
      probabilityDescription: {
        '0': 'every 100 years', // 100 year intervals?
        '1': 'every 10 years', // 10 year intervals?
        '2': 'yearly', // almost yearly?
        '3': 'weekly',
        '4': 'daily',
      },
      example:
        'A scenario with consequence 2 and probability 4 has an estimated risk of ' +
        '30 000 NOK/incident x 50 incidents/year = 1 500 000 NOK/year.',
    },
    rosDialog: {
      titleNew: 'New risk scorecard',
      titleEdit: 'Edit scorecard',
      titleError: 'The scorecard has to have a title',
      scopeDescription:
        'Describe what the risk analysis will assess. Specify any key areas which are not part of the scope.',
      scopeError: 'The scorecard has to have a description of the scope',
    },
    scenarioStepper: {
      initialRiskStep: {
        title: 'Initial risk',
        subtitle:
          'The initial risk is defined by the consequence of the scenario and the probability of it occurring.',
        consequenceSubtitle:
          'How severe is the potential impact? If the scenario can impact more than one category, choose the highest level of consequence.',
        probabilitySubtitle:
          'How likely is it that this scenario will occur? If you are between two probability values, choose the higher one.',
      },
      restRiskStep: {
        title: 'Remaining risk',
        subtitle:
          'What is the risk reduced to when all the planned actions have been completed?',
        consequenceSubtitle:
          'How severe is the consequence of this scenario after all actions are complete?',
        probabilitySubtitle:
          'What is the likelihood of this scenario after all actions are complete?',
      },
    },
    scenarioDrawer: {
      action: {
        requiredError: 'Field is required',
        descriptionError: 'Description cannot be empty',
        urlError: 'Invalid url',
      },
      title: 'Risk scenario',
      titleError: 'Scenario title is required',
      subtitle:
        'An unwanted incident that could potentially harm the component.', // harm or affect negatively?
      threatActorSubtitle: 'Someone who attempts to access or abuse the system', // system or component or both?
      vulnerabilitySubtitle:
        'Weakness in the system that the threat actor can exploit',
      consequenceTab: {
        subtitle:
          'How severe is the potential impact? If the scenario can impact more than one category, choose the highest level of consequence.',
      },
      probabilityTab: {
        subtitle:
          'How likely is it that this scenario will occur? If you are between two probability values, choose the higher one.',
      },
      measureTab: {
        subtitle:
          'What actions should be taken to avoid or reduce the risk of this scenario?',
        measureOwnerDescription:
          'Decide who will be responsible for completion of this action',
        addMeasureButton: 'Add planned action',
        title: 'Actions',
        plannedMeasures: 'Planned actions',
        existingMeasure: 'Existing measures',
        existingMeasureSubtitle:
          'Brief description of relevant measures that have already been implemented to reduce the risk of this scenario',
      },
      restRiskTab: {
        subtitle:
          'Define the remaining risk for the scenario. Remaining risk is the consequence and probability for this ' +
          'scenario after all planned actions have been completed.',
      },
      deleteScenarioButton: 'Delete scenario',
      deleteScenarioConfirmation:
        'Are you sure you want to delete this scenario?',
      closeConfirmation: 'Do you want to save your changes?',
    },
    consequenceTable: {
      rows: {
        '1': 'Negligible', // Insignificant, negligible (ubetydelig)
        '2': 'Small', // Liten
        '3': 'Moderate',
        '4': 'Severe', // Alvorlig
        '5': 'Critical', // Catastrophic eller Critical
      },
      columns: {
        health: 'Life and health', // Health and safety, Life and limb, Health and lives (Liv og helse)
        economical: 'Financial', // Financial consequences, economic implications
        privacy: 'Privacy', // Personvern
        reputation: 'Reputation and trust', // Reputation and trust, confidence, faith (Omdømme og tillit)
      },
      cells: {
        health: {
          '1': 'Impact on life and health cannot be rated less severe than 3', // Liv og helse kan ikke være mindre alvorlig enn 3
          '2': 'Impact on life and health cannot be rated less severe than 3',
          '3': 'Temporary or less severe health implications. Temporary or minor damage to local environment.', // implications, effects or consequence? Temporary or minor? Midlertidige eller mindre alvorlige helsemessige konsekvenser. Midlertidig eller mindre skade på miljøet
          '4': 'Permanent or severe health implications for a few people. Moderate damage to the environment in a limited area.',
          '5': 'Death or permanent severe health implications for many people. Severe damage to the environment across large areas.',
        },
        economical: {
          '1': 'Temporary minor financial loss.\n May be fixed within an hour by one employee',
          '2': 'Temporary financial loss.\n May be fixed within three days by one employee',
          '3': 'Financial loss of some duration.\n May be fixed within a month by three employees',
          '4': 'Financial loss of considerable duration for the organization and any third parties.\n May be fixed within a year by 10 employees',
          '5': 'Permanent and severe financial loss.\n May be fixed within three years by 100 employees',
        },
        privacy: {
          '1': 'The right to privacy is violated for a very short period and does not involve sensitive categories or vulnerable groups', // særlige kategorier = sensitive kategorier? special/particular/sensitive categories
          '2': 'The right to privacy is violated for a longer period and involves sensitive categories or vulnerable groups.',
          '3': 'Violations of the rights and freedoms for the registered people.',
          '4': 'Severe violations and breaches of the rights and freedoms for the registered people, as well as violations of the law.',
          '5': 'Impact on privacy cannot be rated more severe than 4',
        },
        reputation: {
          '1': 'Temporary loss of reputation and little impact on trust',
          '2': 'Negative attention in national media that leads to loss of reputation.\n May reduce trust.',
          '3': 'Lasting negative attention in national and international media that leads to severe loss of reputation.\n Severe loss of trust from authorities.\n Users who do not dare or want to use the services.', // lasting, severe, severe loss, severe loss of trust, do not dare or want to use the services
          '4': 'Impact on reputation and trust cannot be rated more severe than 3',
          '5': 'Impact on reputation and trust cannot be rated more severe than 3',
        },
      },
    },
    probabilityTable: {
      rows: {
        '1': 'Very low', // svært liten
        '2': 'Low', // liten
        '3': 'Moderat', // moderat
        '4': 'High', // stor
        '5': 'Very high', // svært stor
      },
      cells: {
        '1': 'The scenario is unlikely to occur. It occurs less often than every 100 years',
        '2': 'The scenario is unlikely to occur. It can occur every 10 years',
        '3': 'The scenario can occur. It can occur almost every year',
        '4': 'The scenario will very likely occur. It can occur almost weekly',
        '5': 'The scenario is almost guaranteed to occur. It can occur almost daily',
      },
    },
    threatActors: {
      'Script kiddie': 'Script kiddie',
      Hacktivist: 'Hacktivist',
      'Reckless employee': 'Reckless employee',
      Insider: 'Insider',
      'Organised crime': 'Organised crime',
      'Terrorist organisation': 'Terrorist organisation',
      'Nation/government': 'Nation/government',
    },
    vulnerabilities: {
      'Flawed design': 'Flawed design',
      Misconfiguration: 'Misconfiguration',
      'Dependency vulnerability': 'Dependency vulnerability',
      'Unauthorized access': 'Unauthorized use',
      'Unmonitored use': 'Unmonitored use',
      'Input tampering': 'Input tampering',
      'Information leak': 'Information leak',
      'Excessive use': 'Excessive use',
    },
  },
});

export const pluginRiScNorwegianTranslation = createTranslationResource({
  ref: pluginRiScTranslationRef,
  translations: {
    no: () =>
      Promise.resolve({
        default: {
          'contentHeader.title': 'Risiko- og sårbarhetsanalyse',
          'contentHeader.createNewButton': 'Opprett ny analyse',

          'dictionary.cancel': 'Avbryt',
          'dictionary.close': 'Lukk',
          'dictionary.completed': 'Fullført',
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
          'dictionary.measures': 'Tiltak',
          'dictionary.measureOwner': 'Tiltakseier',
          'dictionary.next': 'Neste',
          'dictionary.planned': 'Planlagt',
          'dictionary.previous': 'Forrige',
          'dictionary.probability': 'Sannsynlighet',
          'dictionary.restRisk': 'Restrisiko',
          'dictionary.risk': 'Risiko',
          'dictionary.save': 'Lagre',
          'dictionary.saveAndClose': 'Lagre og lukk',
          'dictionary.saveError':
            'Noe gikk galt ved lagring. Venligst prøv igjen.',
          'dictionary.scenario': 'Scenario',
          'dictionary.scope': 'Omfang',
          'dictionary.status': 'Status',
          'dictionary.threatActors': 'Trusselaktører',
          'dictionary.title': 'Tittel',
          'dictionary.url': 'URL',
          'dictionary.emptyUrl': 'Ingen URL spesifisert',
          'dictionary.vulnerabilities': 'Sårbarheter',

          'scenarioDrawer.action.descriptionError':
            'Beskrivelse kan ikke være tom',
          'scenarioDrawer.action.urlError': 'Ugyldig URL',
          'scenarioDrawer.action.requiredError': 'Feltet er påkrevd',

          'rosStatus.statusBadge.missing':
            'Venter på godkjenning av risikoeier',
          'rosStatus.statusBadge.approved': 'Godkjent av risikoeier',
          'rosStatus.statusBadge.error': 'Kunne ikke hente status',
          'rosStatus.prStatus': ' Avventer godkjenning av pull request i ',
          'rosStatus.approveButton': 'Godkjenn ROS',

          'publishDialog.title': 'Godkjenn ROS-analyse',
          'publishDialog.checkboxLabel':
            'Jeg bekrefter at jeg er risikoeier og godtar risikoen beskrevet i denne risiko- og sårbarhetsanalysen.',

          'scenarioTable.title': 'Risikoscenarioer',
          'scenarioTable.addScenarioButton': 'Legg til scenario',
          'scenarioTable.columns.measuresCount': 'Tiltak',
          'scenarioTable.columns.consequenceChar': 'K',
          'scenarioTable.columns.probabilityChar': 'S',
          'scenarioTable.columns.completed': 'fullført',

          'riskMatrix.title': 'Risikomatrise',
          'riskMatrix.estimatedRisk.title': 'Estimert risiko',
          'riskMatrix.estimatedRisk.suffix.thousand': '{{count}} tusen',
          'riskMatrix.estimatedRisk.suffix.million_one': '{{count}} million',
          'riskMatrix.estimatedRisk.suffix.million_other':
            '{{count}} millioner',
          'riskMatrix.estimatedRisk.suffix.billion_one': '{{count}} milliard',
          'riskMatrix.estimatedRisk.suffix.billion_other':
            '{{count}} milliarder',
          'riskMatrix.estimatedRisk.suffix.trillion_one': '{{count}} billion',
          'riskMatrix.estimatedRisk.suffix.trillion_other':
            '{{count}} billioner',
          'riskMatrix.estimatedRisk.unit.nokPerYear': 'kr/år',
          'riskMatrix.tooltip.title': 'Risikoscenarioer',

          'infoDialog.title': 'Estimert risiko',
          'infoDialog.description':
            'Den estimerte risikoen er basert på hvor stor risiko de forskjellige scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig konsekvens skjer er det høy risiko for at det kan bli en stor kostnad for Kartverket. Kostnaden er med andre ord et forsøk på å konkretisere verdien av risiko og er summen av den estimerte risikoen for alle risikoscenariene i denne ROS-analysen.',
          'infoDialog.calculatedHowTitle':
            'Hvordan regner vi ut estimert risiko?',
          'infoDialog.calculatedHow':
            'Konsekvens måles i kroner per hendelse og sannsynlighet måles i hendelser per år. Den estimerte risikoen blir da: K x S.',
          'infoDialog.consequenceTitle': 'Konsekvens (kr/hendelse)',
          'infoDialog.probabilityTitle': 'Sannsynlighet (hendelser/år)',
          'infoDialog.probabilityDescription.0': 'ca hvert 100. år',
          'infoDialog.probabilityDescription.1': 'ca hvert 10. år',
          'infoDialog.probabilityDescription.2': 'ca årlig',
          'infoDialog.probabilityDescription.3': 'ca ukentlig',
          'infoDialog.probabilityDescription.4': 'ca daglig',
          'infoDialog.example':
            'Et risikoscenario med konsekvens 2 og sannsynlighet 4 har en estimert risiko på 30 000 kr/hendelse x 50 hendelser/år = 1 500 000 kr/år.',

          'rosDialog.titleNew': 'Ny risiko- og sårbarhetsanalyse',
          'rosDialog.titleEdit': 'Rediger tittel og omfang',
          'rosDialog.titleError': 'ROS-analysen må ha en tittel',
          'rosDialog.scopeDescription':
            'Beskriv hva analysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres.', // TODO
          'rosDialog.scopeError': 'ROS-analysen må ha et omfang',

          'scenarioStepper.initialRiskStep.title': 'Startrisiko',
          'scenarioStepper.initialRiskStep.subtitle':
            'Risikoen er kombinasjonen av konsekvensen av scenarioet og sannsynligheten for at det inntreffer.',
          'scenarioStepper.initialRiskStep.consequenceSubtitle':
            'Hvor alvorlig er den potensielle konsekvensen? Hvis konsekvensen gjelder flere kategorier velg det høyeste konsekvensnivået av disse.',
          'scenarioStepper.initialRiskStep.probabilitySubtitle':
            'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme. Dersom du er mellom to sannsynlighetsverdier velg den høyeste.',
          'scenarioStepper.restRiskStep.title': 'Restrisiko',
          'scenarioStepper.restRiskStep.subtitle':
            'Hvordan endrer risikoen seg fra startrisikoen etter alle tiltakene er fullført?',
          'scenarioStepper.restRiskStep.consequenceSubtitle':
            'Hva blir konsekvensen etter alle tiltakene er fullført?',
          'scenarioStepper.restRiskStep.probabilitySubtitle':
            'Hva blir sannsynligheten etter alle tiltakene er fullført?',

          'scenarioDrawer.title': 'Risikoscenario',
          'scenarioDrawer.titleError': 'Scenarioet må ha en tittel',
          'scenarioDrawer.subtitle':
            'En uønsket hendelse som potensielt kan ramme komponenten',
          'scenarioDrawer.threatActorSubtitle':
            'Noen som prøver å få tilgang til eller misbruke systemet',
          'scenarioDrawer.vulnerabilitySubtitle':
            'Svakhet i systemet som kan utnyttes av trusselaktøren',
          'scenarioDrawer.consequenceTab.subtitle':
            'Hvor alvorlig er den potensielle konsekvensen? Hvis scenarioet kan få konsekvenser i flere kategorier velg det høyeste konsekvensnivået av disse.',
          'scenarioDrawer.probabilityTab.subtitle':
            'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme. Dersom du er mellom to sannsynlighetsverdier velg den høyeste.',
          'scenarioDrawer.measureTab.subtitle':
            'Hvilke tiltak bør gjøres for å unngå scenarioet?',
          'scenarioDrawer.measureTab.title': 'Tiltak',
          'scenarioDrawer.measureTab.measureOwnerDescription':
            'De eller den som er ansvarlig for at tiltaket blir gjennomført',
          'scenarioDrawer.measureTab.addMeasureButton': 'Legg til tiltak',
          'scenarioDrawer.measureTab.plannedMeasures': 'Planlagte tiltak',
          'scenarioDrawer.measureTab.existingMeasure': 'Eksisterende tiltak',
          'scenarioDrawer.measureTab.existingMeasureSubtitle':
            'Kort beskrivelse av relevante tiltak som allerede har blitt gjennomført',
          'scenarioDrawer.restRiskTab.subtitle':
            'Sett restrisiko for scenarioet. Restrisiko er konsekvens og sannsynlighet for scenarioet etter at alle tiltak i listen er gjennomført.',
          'scenarioDrawer.deleteScenarioButton': 'Slett scenario',
          'scenarioDrawer.deleteScenarioConfirmation':
            'Er du sikker på at du vil slette scenario?',
          'scenarioDrawer.closeConfirmation': 'Vil du lagre endringene dine?',

          'consequenceTable.rows.1': 'Ubetydelig',
          'consequenceTable.rows.2': 'Liten',
          'consequenceTable.rows.3': 'Moderat',
          'consequenceTable.rows.4': 'Alvorlig',
          'consequenceTable.rows.5': 'Kritisk',
          'consequenceTable.columns.health': 'Liv og helse',
          'consequenceTable.columns.economical': 'Økonomi og drift',
          'consequenceTable.columns.privacy': 'Personvern',
          'consequenceTable.columns.reputation': 'Omdømme og tillit',
          'consequenceTable.cells.health.1':
            'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.2':
            'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.3':
            'Lettere skade på personer.\n Noe skade på lokalt miljø.',
          'consequenceTable.cells.health.4':
            'Et fåtall alvorlige personskader.\n Moderat skade på miljø på et begrenset område.',
          'consequenceTable.cells.health.5':
            'Dødsfall. Svært alvorlig skade på milhø over store områder.',
          'consequenceTable.cells.economical.1':
            'Ubetydelig økonomisk tap.\n Kan fikses i løpet av en time av én ansatt.',
          'consequenceTable.cells.economical.2':
            'Mindre økonomisk tap.\n Kan fikses i løpet av tre dager av én ansatt.',
          'consequenceTable.cells.economical.3':
            'Moderat økonomisk tap.\n Kan fikses i løpet av en måned av tre ansatte.',
          'consequenceTable.cells.economical.4':
            'Større økonomisk tap.\n Kan fikses i løpet av et år av 10 ansatte.',
          'consequenceTable.cells.economical.5':
            'Kritisk økonomisk tap.\n Kan fikses i løpet av tre år av 100 ansatte.',
          'consequenceTable.cells.privacy.1': 'Ingen brudd.',
          'consequenceTable.cells.privacy.2': 'Mindre brudd.',
          'consequenceTable.cells.privacy.3':
            'Brudd på registrertes rettigheter og friheter.',
          'consequenceTable.cells.privacy.4':
            'Meget alvorlige brudd på registrertes rettigheter og friheter, samt lovbrudd.',
          'consequenceTable.cells.privacy.5':
            'Personvern kan ikke være mer alvorlig enn 4',
          'consequenceTable.cells.reputation.1':
            'Liten fare for omdømmetap og liten innvikrning på tillit',
          'consequenceTable.cells.reputation.2':
            'Negativ oppmerksomhet i regionale og nasjonale medier som fører til omdømmetap.\n Kan redusere tillit.',
          'consequenceTable.cells.reputation.3':
            'Negativ oppmerksomhet i nasjonale og internasjonale medier som fører til alvorlig omdømmetap.\n Alvorlig redusert tillit fra myndigheter.\n Brukere som ikke tør / vil bruke tjenestene.',
          'consequenceTable.cells.reputation.4':
            'Omdømme og tillit kan ikke være mer alvorlig enn 3',
          'consequenceTable.cells.reputation.5':
            'Omdømme og tillit kan ikke være mer alvorlig enn 3',

          'probabilityTable.rows.1': 'Svært liten',
          'probabilityTable.rows.2': 'Liten',
          'probabilityTable.rows.3': 'Moderat',
          'probabilityTable.rows.4': 'Stor',
          'probabilityTable.rows.5': 'Svært stor',
          'probabilityTable.cells.1':
            'Scenarioet er usannsynlig å inntreffe. Det inntreffer sjeldnere enn hvert 100. år',
          'probabilityTable.cells.2':
            'Scenarioet er lite sannsynlig å inntreffe. Det kan inntreffe hvert 10. år',
          'probabilityTable.cells.3':
            'Scenarioet kan inntreffe. Det kan inntreffe nærmest årlig',
          'probabilityTable.cells.4':
            'Scenarioet vil med stor sannsynlighet inntreffe. Det kan inntreffe nærmest ukentlig',
          'probabilityTable.cells.5':
            'Scenarioet er nesten garantert å inntreffe. Det kan inntreffe nærmest daglig',
          'threatActors.Script kiddie': 'Datasnok',
          'threatActors.Hacktivist': 'Hacktivist',
          'threatActors.Reckless employee': 'Uheldig ansatt',
          'threatActors.Insider': 'Innside-aktør',
          'threatActors.Organised crime': 'Organiserte kriminelle',
          'threatActors.Terrorist organisation': 'Terroristorganisasjon',
          'threatActors.Nation/government': 'Nasjon/stat',

          'vulnerabilities.Flawed design': 'Mangelfullt design',
          'vulnerabilities.Misconfiguration': 'Feilkonfigurering',
          'vulnerabilities.Dependency vulnerability': 'Sårbarhet i avhengighet',
          'vulnerabilities.Unauthorized access': 'Uautorisert tilgang',
          'vulnerabilities.Unmonitored use': 'Uovervåket bruk',
          'vulnerabilities.Input tampering': 'Klussing med input',
          'vulnerabilities.Information leak': 'Informasjonslekkasje',
          'vulnerabilities.Excessive use': 'Overdreven bruk',
        },
      }),
  },
});
