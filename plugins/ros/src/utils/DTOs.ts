import { CreateRiScFrom } from '../components/riScDialog/RiScDialog';
import {
  Action,
  ContentStatus,
  LastPublished,
  MigrationStatus,
  Modify,
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
  sopsConfig: SopsConfigDTO;
} & ProcessRiScResultDTO;

export type DeleteRiScResultDTO = ProcessRiScResultDTO;

export type RiScContentResultDTO = {
  riScStatus: RiScStatus;
  riScContent: string;
  sopsConfig: SopsConfigDTO;
  migrationStatus: MigrationStatus;
  lastPublished: LastPublished;
} & ContentRiScResultDTO;

export type RiScDTO = {
  schemaVersion: string;
  title: string;
  scope: string;
  valuations: Valuations[];
  scenarios: ScenarioDTO[];
};

export type GcpCryptoKeyObject = {
  projectId: string;
  keyRing: string;
  keyName: string;
  locations: string;
  resourceId: string;
  createdAt: string;
  hasEncryptDecryptAccess?: boolean;
};

export type ScenarioDTO = {
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

export type ActionsDTO = {
  title: string;
  action: {
    ID: string;
    description: string;
    status: string;
    url: string;
    lastUpdated?: Date | null;
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

export function dtoToScenario(scenarioDTO: ScenarioDTO): Scenario {
  return {
    ...scenarioDTO.scenario,
    title: scenarioDTO.title,
    actions: scenarioDTO.scenario.actions.map(dtoToAction),
  };
}

export function dtoToAction(actionDTO: ActionsDTO): Action {
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

export function riScToDTOString(
  riSc: RiSc,
  isRequiresNewApproval: boolean,
  profile: ProfileInfo,
  sopsConfig: SopsConfigDTO,
  initialRiScType?: CreateRiScFrom[],
): string {
  const json = JSON.stringify({
    riSc: JSON.stringify(riScToDTO(riSc)),
    isRequiresNewApproval: isRequiresNewApproval,
    schemaVersion: riSc.schemaVersion,
    defaultRiScTypes: initialRiScType,
    userInfo: {
      name: profile.displayName ?? '',
      email: profile.email ?? '',
    },
    sopsConfig: sopsConfig,
  });
  return json;
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
      lastUpdated: action.lastUpdated,
    },
  };
}

export type SopsConfigDTO = {
  shamir_threshold: number;
  age?: AgeEntry[];
  gcp_kms: GcpKmsEntry[];
  lastModified?: string;
  unencrypted_suffix?: string;
  version?: string;
};

export type GcpKmsEntry = {
  resource_id: string;
  created_at: string;
};

export type AgeEntry = {
  recipient: string;
};
