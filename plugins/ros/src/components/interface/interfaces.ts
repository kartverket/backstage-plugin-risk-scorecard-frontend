export interface ROS {
  versjon: string;
  skjema_versjon: string;
  ID: string;
  scenarier: Scenario[];
}

export interface Scenario {
  ID: string;
  url?: string;
  sistEndret: string;
  beskrivelse: string;
  trusselaktører: string[];
  sårbarheter: string[];
  risiko: Risiko;
  tiltak: Tiltak[];
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
  frist: Date;
  status: string;
  restrisisko: Risiko;
}

export interface TableData {
  id: number;
  beskrivelse: string;
  trussel: string;
  sårbarhet: string;
  konsekvens: number;
  sannsynlighet: number;
}
