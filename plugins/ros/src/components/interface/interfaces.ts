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

export interface TableData {
  id: string;
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
