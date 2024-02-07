export interface ROS {
  versjon: string;
  skjemaVersjon: string;
  tittel: string;
  omfang: string;
  scenarier: Scenario[];
}

export interface Scenario {
  ID: number;
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
  ID: number;
  beskrivelse: string;
  tiltakseier: string;
  frist: string;
  status: string;
}

export interface TableData {
  id: number;
  beskrivelse: string;
  trussel: string;
  sårbarhet: string;
  konsekvens: number;
  sannsynlighet: number;
}

export interface GithubRepoInfo {
  name: string;
  owner: string;
}

export const emptyScenario = (): Scenario => ({
  ID: Math.floor(Math.random() * 100000),
  beskrivelse: '',
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: '',
    sannsynlighet: 1,
    konsekvens: 1,
  },
  tiltak: [],
  restrisiko: {
    oppsummering: '',
    sannsynlighet: 1,
    konsekvens: 1,
  },
});

export const emptyTiltak = (): Tiltak => ({
  ID: Math.floor(Math.random() * 100000),
  beskrivelse: '',
  tiltakseier: '',
  frist: new Date().toISOString().split('T')[0],
  status: 'Ikke startet',
});
