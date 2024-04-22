import { RiSc, ProcessingStatus, Scenario, Action, Risk } from './types';
import {
  consequenceOptions,
  riskMatrix,
  probabilityOptions,
} from './constants';

export function generateRandomId(): string {
  return [...Array(5)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}

const formatter = new Intl.NumberFormat('nb-NO', {
  maximumFractionDigits: 0,
});

export function formatNOK(amount: number): string {
  return formatter.format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getAlertSeverity(
  status: ProcessingStatus,
): 'error' | 'warning' | 'info' {
  switch (status) {
    case ProcessingStatus.UpdatedRiSc:
    case ProcessingStatus.CreatedRiSc:
    case ProcessingStatus.CreatedPullRequest:
      return 'info';
    default:
      return 'warning';
  }
}

export function getRiskMatrixColor(risiko: Risk) {
  const sannsynlighet = probabilityOptions.indexOf(risiko.probability);
  const konsekvens = consequenceOptions.indexOf(risiko.consequence);
  return riskMatrix[4 - konsekvens][sannsynlighet];
}

export const getSannsynlighetLevel = (risiko: Risk) =>
  probabilityOptions.indexOf(risiko.probability) + 1;

export const getKonsekvensLevel = (risiko: Risk) =>
  consequenceOptions.indexOf(risiko.consequence) + 1;

export const emptyRiSc = (): RiSc => ({
  schemaVersion: '3.2',
  title: '',
  scope: '',
  valuations: [],
  scenarios: [],
});

export const emptyScenario = (): Scenario => ({
  ID: generateRandomId(),
  title: '',
  description: '',
  threatActors: [],
  vulnerabilities: [],
  risk: {
    summary: '',
    probability: 0.01,
    consequence: 1000,
  },
  existingActions: '',
  actions: [],
  remainingRisk: {
    summary: '',
    probability: 0.01,
    consequence: 1000,
  },
});

export const emptyTiltak = (): Action => ({
  ID: generateRandomId(),
  title: '',
  description: '',
  owner: '',
  deadline: new Date().toISOString().split('T')[0],
  status: 'Ikke startet',
});

// keys that does not change the approval status: tittel, beskrivelse, oppsummering, tiltak.beskrivelse, tiltak.tiltakseier, tiltak.status
export const requiresNewApproval = (
  oldRiSc: RiSc,
  updatedRiSc: RiSc,
): boolean => {
  if (oldRiSc.scenarios.length !== updatedRiSc.scenarios.length) {
    return true;
  }
  let requiresApproval = false;

  oldRiSc.scenarios.map((oldScenario, index) => {
    const updatedScenario = updatedRiSc.scenarios[index];

    if (oldScenario.threatActors !== updatedScenario.threatActors)
      requiresApproval = true;
    if (oldScenario.vulnerabilities !== updatedScenario.vulnerabilities)
      requiresApproval = true;

    if (oldScenario.risk.probability !== updatedScenario.risk.probability)
      requiresApproval = true;
    if (oldScenario.risk.consequence !== updatedScenario.risk.consequence)
      requiresApproval = true;
    if (oldScenario.actions.length !== updatedScenario.actions.length)
      requiresApproval = true;

    if (
      oldScenario.remainingRisk.probability !==
      updatedScenario.remainingRisk.probability
    )
      requiresApproval = true;
    if (
      oldScenario.remainingRisk.consequence !==
      updatedScenario.remainingRisk.consequence
    )
      requiresApproval = true;

    oldScenario.actions.map((oldTiltak, i) => {
      const updatedTiltak = updatedScenario.actions[i];

      if (oldTiltak.deadline !== updatedTiltak.deadline)
        requiresApproval = true;
    });
  });
  return requiresApproval;
};
