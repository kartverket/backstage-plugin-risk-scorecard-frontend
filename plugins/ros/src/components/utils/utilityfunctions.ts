import { ROS, ProcessingStatus, Scenario, Tiltak, Risiko } from './types';
import {
  konsekvensOptions,
  riskMatrix,
  sannsynlighetOptions,
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
    case ProcessingStatus.UpdatedROS:
    case ProcessingStatus.CreatedROS:
    case ProcessingStatus.CreatedPullRequest:
      return 'info';
    default:
      return 'warning';
  }
}

export function getRiskMatrixColor(risiko: Risiko) {
  const sannsynlighet = sannsynlighetOptions.indexOf(risiko.sannsynlighet);
  const konsekvens = konsekvensOptions.indexOf(risiko.konsekvens);
  return riskMatrix[4 - konsekvens][sannsynlighet];
}

export const getSannsynlighetLevel = (risiko: Risiko) =>
  sannsynlighetOptions.indexOf(risiko.sannsynlighet) + 1;

export const getKonsekvensLevel = (risiko: Risiko) =>
  konsekvensOptions.indexOf(risiko.konsekvens) + 1;

export const emptyROS = (): ROS => ({
  skjemaVersjon: '3.1',
  tittel: '',
  omfang: '',
  verdivurderinger: [],
  scenarier: [],
});

export const emptyScenario = (): Scenario => ({
  ID: generateRandomId(),
  tittel: '',
  beskrivelse: '',
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
  eksisterendeTiltak: '',
  tiltak: [],
  restrisiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
});

export const emptyTiltak = (): Tiltak => ({
  ID: generateRandomId(),
  tittel: '',
  beskrivelse: '',
  tiltakseier: '',
  frist: new Date().toISOString().split('T')[0],
  status: 'Ikke startet',
});

// keys that does not change the approval status: tittel, beskrivelse, oppsummering, tiltak.beskrivelse, tiltak.tiltakseier, tiltak.status
export const requiresNewApproval = (oldROS: ROS, updatedROS: ROS): boolean => {
  if (oldROS.scenarier.length !== updatedROS.scenarier.length) {
    return true;
  }
  let requiresApproval = false;

  oldROS.scenarier.map((oldScenario, index) => {
    const updatedScenario = updatedROS.scenarier[index];

    if (oldScenario.trusselaktører !== updatedScenario.trusselaktører)
      requiresApproval = true;
    if (oldScenario.sårbarheter !== updatedScenario.sårbarheter)
      requiresApproval = true;

    if (
      oldScenario.risiko.sannsynlighet !== updatedScenario.risiko.sannsynlighet
    )
      requiresApproval = true;
    if (oldScenario.risiko.konsekvens !== updatedScenario.risiko.konsekvens)
      requiresApproval = true;
    if (oldScenario.tiltak.length !== updatedScenario.tiltak.length)
      requiresApproval = true;

    if (
      oldScenario.restrisiko.sannsynlighet !==
      updatedScenario.restrisiko.sannsynlighet
    )
      requiresApproval = true;
    if (
      oldScenario.restrisiko.konsekvens !==
      updatedScenario.restrisiko.konsekvens
    )
      requiresApproval = true;

    oldScenario.tiltak.map((oldTiltak, i) => {
      const updatedTiltak = updatedScenario.tiltak[i];

      if (oldTiltak.frist !== updatedTiltak.frist) requiresApproval = true;
    });
  });
  return requiresApproval;
};
