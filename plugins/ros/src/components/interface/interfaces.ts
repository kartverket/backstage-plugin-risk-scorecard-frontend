export interface ROS {
  versjon: string;
  skjemaVersjon: string;
  scenarier: Scenario[];
}

export interface Scenario {
  ID: number;
  url?: string;
  sistEndret: string;
  beskrivelse: string;
  trusselaktorer: string[];
  sarbarheter: string[];
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
  sarbarhet: string;
  konsekvens: number;
  sannsynlighet: number;
}
