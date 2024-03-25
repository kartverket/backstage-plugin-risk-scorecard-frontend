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
  rosId: string;
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
  rosStatus: RosStatus;
  rosContent: string;
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
    scenarier: rosDTO.scenarier.map(dtoToScenario),
  };
}

function dtoToScenario(scenarioDTO: ScenarioDTO): Scenario {
  return {
    ...scenarioDTO.scenario,
    tittel: scenarioDTO.tittel,
    tiltak: scenarioDTO.scenario.tiltak.map(dtoToTiltak),
  };
}

function dtoToTiltak(tiltakDTO: TiltakDTO): Tiltak {
  return {
    ...tiltakDTO.oppgave,
    tittel: tiltakDTO.tittel,
  };
}

export function rosToDTOString(ros: ROS): string {
  return JSON.stringify({ ros: JSON.stringify(rosToDTO(ros)) });
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
