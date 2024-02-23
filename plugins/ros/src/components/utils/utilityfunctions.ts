import { ROS, ProcessingStatus, Scenario, Tiltak } from './types';
import { konsekvensOptions, sannsynlighetOptions } from './constants';

export function generateRandomId(): string {
  return [...Array(3)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}

const formatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
  maximumFractionDigits: 0,
});

export function formatNOK(amount: number): string {
  return formatter.format(amount);
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

export const getSannsynlighetLevel = (scenario: Scenario) =>
  sannsynlighetOptions.indexOf(scenario.risiko.sannsynlighet) + 1;

export const getKonsekvensLevel = (scenario: Scenario) =>
  konsekvensOptions.indexOf(scenario.risiko.konsekvens) + 1;

export const getRestSannsynlighetLevel = (scenario: Scenario) =>
  sannsynlighetOptions.indexOf(scenario.restrisiko.sannsynlighet) + 1;

export const getRestKonsekvensLevel = (scenario: Scenario) =>
  konsekvensOptions.indexOf(scenario.restrisiko.konsekvens) + 1;

export const emptyROS = (withVersions: boolean): ROS => ({
  skjemaVersjon: withVersions ? '1' : '',
  tittel: '',
  omfang: '',
  scenarier: [],
});

export const emptyScenario = (): Scenario => ({
  ID: generateRandomId(),
  tittel: '',
  beskrivelse: '',
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
  tiltak: [],
  restrisiko: {
    oppsummering: '',
    sannsynlighet: 0.01,
    konsekvens: 1000,
  },
});

export const emptyTiltak = (): Tiltak => ({
  ID: generateRandomId(),
  beskrivelse: '',
  tiltakseier: '',
  frist: new Date().toISOString().split('T')[0],
  status: 'Ikke startet',
});
