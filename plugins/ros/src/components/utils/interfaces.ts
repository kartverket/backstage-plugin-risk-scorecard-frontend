import { generateRandomId } from './utilityfunctions';

export interface ROS {
  skjemaVersjon: string;
  tittel: string;
  omfang: string;
  scenarier: Scenario[];
}

export interface Scenario {
  ID: string;
  tittel: string;
  url?: string;
  sistEndret: string;
  beskrivelse: string;
  trusselaktører: string[];
  sårbarheter: string[];
  risiko: Risiko;
  tiltak: Tiltak[];
  restrisiko: Risiko;
}

export interface Risiko {
  oppsummering: string;
  sannsynlighet: number;
  konsekvens: number;
}

export interface Tiltak {
  ID: string;
  beskrivelse: string;
  tiltakseier: string;
  frist: string;
  status: string;
}

export interface GithubRepoInfo {
  name: string;
  owner: string;
}

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
