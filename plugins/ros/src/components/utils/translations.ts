import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const pluginTranslationRef = createTranslationRef({
  id: 'plugin.ros',
  messages: {
    contentHeader: {
      title: 'Risiko- og sårbarhetsanalyse',
    },
    createNewButton: 'Opprett ny analyse',
    initialRiskLabel: 'Startrisiko',
    restRiskLabel: 'Restrisiko',
    consequenceLabel: 'Konsekvens',
    probabilityLabel: 'Sannsynlighet',
    rosInfo: {
      descriptionHeader: 'Omfang',
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
      header: 'Risikoscenarioer',
      addScenarioButton: 'Legg til risikoscenario',
      columns: {
        title: 'Tittel',
        actionsCount: 'Antall tiltak',
        consequenceChar: 'K',
        probabilityChar: 'S',
        completed: 'fullførte',
      },
    },
    riskMatrix: {
      header: 'Risikomatrise',
      estimatedRisk: {
        header: 'Estimert risiko',
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
          nokPerYear: 'kr/år',
        },
      },
    },
  },
});
