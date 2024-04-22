import {
  ProcessingStatus,
  Risiko,
  ROS,
  RosStatus,
  Scenario,
  Tiltak,
  Verdivurdering,
} from './types';

export type ProcessROSResultDTO = {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
};

export type PublishROSResultDTO = {
  pendingApproval?: {
    pullRequestUrl: string;
    pullRequestName: string;
  };
} & ProcessROSResultDTO;

export type ROSContentResultDTO = {
  riScStatus: RosStatus;
  riScContent: string;
} & ProcessROSResultDTO;

export type ROSDTO = {
  skjemaVersjon: string;
  tittel: string;
  omfang: string;
  verdivurderinger: Verdivurdering[];
  scenarier: ScenarioDTO[];
};

type ScenarioDTO = {
  tittel: string;
  scenario: {
    ID: string;
    url?: string;
    beskrivelse: string;
    trusselaktører: string[];
    sårbarheter: string[];
    risiko: Risiko;
    eksisterendeTiltak?: string;
    tiltak: TiltakDTO[];
    restrisiko: Risiko;
  };
};

type TiltakDTO = {
  tittel: string;
  oppgave: {
    ID: string;
    beskrivelse: string;
    tiltakseier: string;
    frist: string;
    status: string;
  };
};

export function dtoToROS(rosDTO: ROSDTO): ROS {
  return {
    ...rosDTO,
    // TODO implementere løsning for migrering, kan bumpe fra 3.1 til 3.2 på denne måten manuelt ved å åpne og lagre rosen:
    // skjemaVersjon: '3.2',
    scenarier: rosDTO.scenarier.map(dtoToScenario),
  };
}

function dtoToScenario(scenarioDTO: ScenarioDTO): Scenario {
  return {
    ...scenarioDTO.scenario,
    tittel: scenarioDTO.tittel,
    eksisterendeTiltak: scenarioDTO.scenario.eksisterendeTiltak || '',
    tiltak: scenarioDTO.scenario.tiltak.map(dtoToTiltak),
  };
}

function dtoToTiltak(tiltakDTO: TiltakDTO): Tiltak {
  return {
    ...tiltakDTO.oppgave,
    tittel: tiltakDTO.tittel,
  };
}

export function rosToDTOString(
  ros: ROS,
  isRequiresNewApproval: boolean,
): string {
  return JSON.stringify({
    riSc: JSON.stringify(rosToDTO(ros)),
    isRequiresNewApproval: isRequiresNewApproval,
    schemaVersion: ros.skjemaVersjon,
  });
}

function rosToDTO(ros: ROS): ROSDTO {
  return {
    ...ros,
    scenarier: ros.scenarier.map(scenarioToDTO),
  };
}

function scenarioToDTO(scenario: Scenario): ScenarioDTO {
  return {
    tittel: scenario.tittel,
    scenario: {
      ID: scenario.ID,
      url: scenario.url,
      beskrivelse: scenario.beskrivelse,
      trusselaktører: scenario.trusselaktører,
      sårbarheter: scenario.sårbarheter,
      risiko: scenario.risiko,
      eksisterendeTiltak: scenario.eksisterendeTiltak.length === 0 ? undefined : scenario.eksisterendeTiltak,
      tiltak: scenario.tiltak.map(tiltakToDTO),
      restrisiko: scenario.restrisiko,
    },
  };
}

function tiltakToDTO(tiltak: Tiltak): TiltakDTO {
  return {
    tittel: tiltak.tittel,
    oppgave: {
      ID: tiltak.ID,
      beskrivelse: tiltak.beskrivelse,
      tiltakseier: tiltak.tiltakseier,
      frist: tiltak.frist,
      status: tiltak.status,
    },
  };
}
