import {
  Action,
  ProcessingStatus,
  RiSc,
  RiScStatus,
  Risk,
  Scenario,
  Valuations,
} from './types';
import { ProfileInfo } from '@backstage/core-plugin-api';

export type ProcessRiScResultDTO = {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
};

export type PublishRiScResultDTO = {
  pendingApproval?: {
    pullRequestUrl: string;
    pullRequestName: string;
  };
} & ProcessRiScResultDTO;

export type RiScContentResultDTO = {
  riScStatus: RiScStatus;
  riScContent: string;
} & ProcessRiScResultDTO;

export type RiScDTO = {
  schemaVersion: string;
  title: string;
  scope: string;
  valuations: Valuations[];
  scenarios: ScenarioDTO[];
};

type ScenarioDTO = {
  title: string;
  scenario: {
    ID: string;
    url?: string;
    description: string;
    threatActors: string[];
    vulnerabilities: string[];
    risk: Risk;
    existingActions?: string;
    actions: ActionsDTO[];
    remainingRisk: Risk;
  };
};

type ActionsDTO = {
  title: string;
  action: {
    ID: string;
    description: string;
    owner: string;
    deadline: string;
    status: string;
  };
};

export function dtoToRiSc(riScDTO: RiScDTO): RiSc {
  return {
    ...riScDTO,
    // TODO implementere løsning for migrering, kan bumpe fra 3.1 til 3.2 på denne måten manuelt ved å åpne og lagre riscen:
    // skjemaVersjon: '3.2',
    scenarios: riScDTO.scenarios.map(dtoToScenario),
  };
}

function dtoToScenario(scenarioDTO: ScenarioDTO): Scenario {
  return {
    ...scenarioDTO.scenario,
    title: scenarioDTO.title,
    existingActions: scenarioDTO.scenario.existingActions || '',
    actions: scenarioDTO.scenario.actions.map(dtoToAction),
  };
}

function dtoToAction(actionDTO: ActionsDTO): Action {
  return {
    ...actionDTO.action,
    title: actionDTO.title,
  };
}

export function profileInfoToDTOString(profile: ProfileInfo): string {
  return JSON.stringify({
    name: profile.displayName!!, // TODO: Fjern !! når vi har løst problemet med at displayName kan være undefined
    email: profile.email!!,
  });
}

export function riScToDTOString(
  riSc: RiSc,
  isRequiresNewApproval: boolean,
  profile: ProfileInfo,
): string {
  return JSON.stringify({
    riSc: JSON.stringify(riScToDTO(riSc)),
    isRequiresNewApproval: isRequiresNewApproval,
    schemaVersion: riSc.schemaVersion,
    userInfo: {
      name: profile.displayName!!, // TODO: Fjern !! når vi har løst problemet med at displayName kan være undefined
      email: profile.email!!,
    },
  });
}

function riScToDTO(riSc: RiSc): RiScDTO {
  return {
    ...riSc,
    scenarios: riSc.scenarios.map(scenarioToDTO),
  };
}

function scenarioToDTO(scenario: Scenario): ScenarioDTO {
  return {
    title: scenario.title,
    scenario: {
      ID: scenario.ID,
      url: scenario.url,
      description: scenario.description,
      threatActors: scenario.threatActors,
      vulnerabilities: scenario.vulnerabilities,
      risk: scenario.risk,
      existingActions:
        scenario.existingActions.length === 0
          ? undefined
          : scenario.existingActions,
      actions: scenario.actions.map(actionToDTO),
      remainingRisk: scenario.remainingRisk,
    },
  };
}

function actionToDTO(action: Action): ActionsDTO {
  return {
    title: action.title,
    action: {
      ID: action.ID,
      description: action.description,
      owner: action.owner,
      deadline: action.deadline,
      status: action.status,
    },
  };
}
