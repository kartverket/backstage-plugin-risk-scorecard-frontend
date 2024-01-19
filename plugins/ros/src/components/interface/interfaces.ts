export interface ROS {
  versjon: string;
  skjema_versjon: string;
  "ID": string;
  scenarier: Scenario[];
}

export interface Scenario {
  ID: string;
  url: string;
  beskrivelse: string;
  trusselaktører: string[];
  sårbarheter: string[];
  risiko: Risiko;
  tiltak: Tiltak[];
}

interface Risiko {
  oppsummering: string;
  sannsynlighet: number;
  konsekvens: number;
}

interface Tiltak {
  ID: number;
  beskrivelse: string;
  tiltakseier: string;
  frist: Date;
  status: string;
  restrisisko: Risiko;
}