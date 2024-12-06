import {
  Action,
  ContentStatus,
  MigrationStatus,
  Modify,
  ProcessingStatus,
  RiSc,
  RiScStatus,
  Risk,
  Scenario,
  SopsConfig,
  Valuations,
} from './types';
import { ProfileInfo } from '@backstage/core-plugin-api';

export type ProcessRiScResultDTO = {
  riScId: string;
  status: ProcessingStatus;
  statusMessage: string;
  riScContent: string | null;
};

// Takes a normal ProcessRiScResultDTO and changes status to ContentStatus.
type ContentRiScResultDTO = Modify<
  ProcessRiScResultDTO,
  'status',
  ContentStatus
> & { pullRequestUrl: string };

export type PublishRiScResultDTO = {
  pendingApproval?: {
    pullRequestUrl: string;
    pullRequestName: string;
  };
} & ProcessRiScResultDTO;

export type CreateRiScResultDTO = {
  riScId: String;
  status: ProcessingStatus;
  statusMessage: string;
  riScContent: string | null;
} & ProcessRiScResultDTO;

export type RiScContentResultDTO = {
  riScStatus: RiScStatus;
  riScContent: string;
  migrationStatus: MigrationStatus;
} & ContentRiScResultDTO;

export type RiScDTO = {
  schemaVersion: string;
  title: string;
  scope: string;
  valuations: Valuations[];
  scenarios: ScenarioDTO[];
};

export type SopsConfigResultDTO = {
  status: ProcessingStatus;
  statusMessage: string;
  gcpCryptoKeys: GcpCryptoKeyObject[];
  sopsConfigs: SopsConfig[];
} & ProcessRiScResultDTO;

export type GcpCryptoKeyObject = {
  projectId: string;
  keyRing: string;
  name: string;
};

export type PullRequestObject = {
  url: string;
  title: string;
  openedBy: string;
  createdAt: string;
};

export type SopsConfigRequestBody = {
  gcpCryptoKey: GcpCryptoKeyObject;
  publicAgeKeys: string[];
};

export type SopsConfigCreateResponse = {
  status: ProcessingStatus;
  statusMessage: string;
  sopsConfig: SopsConfig;
} & ProcessRiScResultDTO;

export type SopsConfigUpdateResponse = {
  status: ProcessingStatus;
  statusMessage: string;
} & ProcessRiScResultDTO;

export type OpenPullRequestForSopsConfigResponseBody = {
  status: ProcessingStatus;
  statusMessage: string;
  pullRequest: PullRequestObject;
} & ProcessRiScResultDTO;

type ScenarioDTO = {
  title: string;
  scenario: {
    ID: string;
    url?: string;
    description: string;
    threatActors: string[];
    vulnerabilities: string[];
    risk: Risk;
    actions: ActionsDTO[];
    remainingRisk: Risk;
  };
};

type ActionsDTO = {
  title: string;
  action: {
    ID: string;
    description: string;
    status: string;
    url: string;
  };
};

export function dtoToRiSc(riScDTO: RiScDTO): RiSc {
  return {
    ...riScDTO,
    // TODO implementere løsning for migrering, kan bumpe fra 3.2 til 3.3 på denne måten manuelt ved å åpne og lagre riscen:
    // skjemaVersjon: '3.3',
    scenarios: riScDTO.scenarios.map(dtoToScenario),
  };
}

function dtoToScenario(scenarioDTO: ScenarioDTO): Scenario {
  return {
    ...scenarioDTO.scenario,
    title: scenarioDTO.title,
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
    name: profile.displayName ?? '',
    email: profile.email ?? '',
  });
}

export function sopsConfigToDTOString(
  sopsConfig: SopsConfigRequestBody,
): string {
  return JSON.stringify({
    gcpCryptoKey: {
      projectId: sopsConfig.gcpCryptoKey.projectId,
      keyRing: sopsConfig.gcpCryptoKey.keyRing,
      name: sopsConfig.gcpCryptoKey.name,
    },
    publicAgeKeys: sopsConfig.publicAgeKeys,
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
      name: profile.displayName ?? '',
      email: profile.email ?? '',
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
      status: action.status,
      url: action.url,
    },
  };
}
