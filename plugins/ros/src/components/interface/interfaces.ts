import { RosStatus } from '../utils/types';

export interface ROSWrapper {
  content: ROS;
  id: string;
}

export interface ROSTitleAndIdAndStatus {
  tittel: string;
  id: string;
  status: RosStatus;
}

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
  restrisiko: Risiko;
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
