/* eslint-disable no-console */
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
  sopsConfig: SopsConfigDTO;
} & ProcessRiScResultDTO;

export type RiScContentResultDTO = {
  riScStatus: RiScStatus;
  riScContent: string;
  sopsConfig: SopsConfigDTO;
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
  keyName: string;
  locations: string;
  resourceId: string;
  createdAt: string;
  hasEncryptDecryptAccess?: boolean;
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
      keyName: sopsConfig.gcpCryptoKey.keyName,
    },
    publicAgeKeys: sopsConfig.publicAgeKeys,
  });
}

export function riScToDTOString(
  riSc: RiSc,
  isRequiresNewApproval: boolean,
  profile: ProfileInfo,
  sopsConfig: SopsConfigDTO,
): string {
  return JSON.stringify({
    riSc: JSON.stringify(riScToDTO(riSc)),
    isRequiresNewApproval: isRequiresNewApproval,
    schemaVersion: riSc.schemaVersion,
    userInfo: {
      name: profile.displayName ?? '',
      email: profile.email ?? '',
    },
    sopsConfig: sopsConfig,
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

export type SopsConfigDTO = {
  shamir_threshold: number;
  key_groups: KeyGroup[];
  kms?: any[];
  gcp_kms?: any[];
  age?: any[];
  lastmodified?: string;
  unencrypted_suffix?: string;
  version?: string;
};

type KeyGroup = {
  gcp_kms?: GcpKmsEntry[];
  hc_vault?: any[];
  age?: AgeEntry[];
};

type GcpKmsEntry = {
  resource_id: string;
  created_at: string;
};

type AgeEntry = {
  recipient: string;
};
/*
export function rawSopsConfigToSopsConfig(raw: SopsConfigDTO): SopsConfig {
  const gcpKeyGroup = raw.key_groups.find(group => group.gcp_kms && group.gcp_kms.length > 0);
  const gcpKmsEntry = gcpKeyGroup?.gcp_kms?.[0];
  const resourceId = gcpKmsEntry?.resource_id;
  // eslint-disable-next-line spaced-comment
  //"projects/skvis-prod-9329/locations/europe-north1/keyRings/skvis-risc-key-ring/cryptoKeys/skvis-risc-crypto-key"
  const [, projectId, , locations, , keyRing, ,cryptoKeyName] = resourceId?.split('/').filter(Boolean) ?? [];
  // Collect all age keys from all key groups
  const publicAgeKeys = raw.key_groups
    .flatMap(group => group.age ?? [])
    .map(age => age.recipient);

  return {
    shamirThreshold: raw.shamir_threshold,  
    version: raw.version ?? '',
    gcpCryptoKey: {
      projectId: projectId ?? '',
      keyRing: keyRing ?? '',
      keyName: cryptoKeyName ?? '',
      locations: locations ?? '',
      resourceId: resourceId ?? '',
      createdAt: gcpKmsEntry?.created_at ?? '',
    },
    publicAgeKeys,
  };
}
*/
export function sopsConfigToRawSopsConfig(sopsConfig: SopsConfig): SopsConfigDTO {
  const rawSopsConfig = {
      shamir_threshold: sopsConfig.shamirThreshold ?? 2,
      key_groups: [ { gcp_kms: [ { resource_id: sopsConfig.gcpCryptoKey.resourceId, created_at: sopsConfig.gcpCryptoKey.createdAt} ], hc_vault: [], age: [] }, { age: sopsConfig.publicAgeKeys.map(key => ({ recipient: key })) } ],
    };
    return rawSopsConfig;
  }