import { formatISO } from 'date-fns';
import { UpdateStatus } from '../contexts/RiScContext';
import {
  ActionStatusOptions,
  BASE_NUMBER,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
  latestSupportedVersion,
  riskMatrix,
} from './constants';
import { RiSc, RiScWithMetadata, Risk, Scenario } from './types';

export function generateRandomId(): string {
  return [...Array(5)]
    .map(() => {
      const randomChar = Math.random().toString(36)[2];
      return Math.random() < 0.5 ? randomChar.toUpperCase() : randomChar;
    })
    .join('');
}

const formatter = new Intl.NumberFormat('nb-NO', {
  maximumFractionDigits: 0,
});

export function formatNOK(amount: number): string {
  return formatter.format(amount);
}

export function getAlertSeverity(
  updateStatus: UpdateStatus,
): 'error' | 'info' | 'warning' {
  if (updateStatus.isSuccess) {
    return 'info';
  } else if (updateStatus.isError) {
    return 'error';
  }
  return 'warning';
}

export function getRiskMatrixColor(risiko: Risk) {
  const sannsynlighet = findProbabilityIndex(risiko.probability);
  const konsekvens = findConsequenceIndex(risiko.consequence);
  return riskMatrix[4 - konsekvens][sannsynlighet];
}

export function getProbabilityLevel(risiko: Risk) {
  return findProbabilityIndex(risiko.probability) + 1;
}

export function getConsequenceLevel(risiko: Risk) {
  return findConsequenceIndex(risiko.consequence) + 1;
}

export function emptyRiSc(): RiSc {
  return {
    schemaVersion: latestSupportedVersion,
    title: '',
    scope: '',
    valuations: [],
    scenarios: [],
  };
}

export function calculateDaysSince(dateString: Date) {
  const givenDate = dateString;
  const now = new Date();

  const diffTime = now.getTime() - givenDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export const UpdatedStatusEnum = {
  UPDATED: 'UPDATED',
  LITTLE_OUTDATED: 'LITTLE_OUTDATED',
  OUTDATED: 'OUTDATED',
  VERY_OUTDATED: 'VERY_OUTDATED',
} as const;

export type UpdatedStatusEnumType =
  (typeof UpdatedStatusEnum)[keyof typeof UpdatedStatusEnum];

export function calculateUpdatedStatus(
  daysSinceLastModified: number | null,
  numOfCommitsBehind: number | null,
): UpdatedStatusEnumType {
  if (daysSinceLastModified === null || numOfCommitsBehind === null) {
    return UpdatedStatusEnum.VERY_OUTDATED;
  }

  const days = daysSinceLastModified;
  const commits = numOfCommitsBehind;

  if (commits > 50) {
    return UpdatedStatusEnum.VERY_OUTDATED;
  }

  if (commits >= 26 && commits <= 50) {
    if (days <= 30) return UpdatedStatusEnum.LITTLE_OUTDATED;
    if (days >= 31 && days <= 90) return UpdatedStatusEnum.OUTDATED;
    return UpdatedStatusEnum.VERY_OUTDATED;
  }

  if (commits >= 11 && commits <= 25) {
    if (days <= 30) return UpdatedStatusEnum.UPDATED;
    if (days >= 31 && days <= 90) return UpdatedStatusEnum.LITTLE_OUTDATED;
    if (days >= 91 && days <= 180) return UpdatedStatusEnum.OUTDATED;
    return UpdatedStatusEnum.VERY_OUTDATED;
  }

  if (commits <= 10) {
    return days <= 60
      ? UpdatedStatusEnum.UPDATED
      : UpdatedStatusEnum.LITTLE_OUTDATED;
  }

  return UpdatedStatusEnum.VERY_OUTDATED;
}

export function requiresNewApproval(oldRiSc: RiSc, updatedRiSc: RiSc): boolean {
  return !isDeeplyEqual(
    oldRiSc.scenarios.sort(
      (scenario1, scenario2) => Number(scenario1.ID) - Number(scenario2.ID),
    ),
    updatedRiSc.scenarios.sort(
      (scenario1, scenario2) => Number(scenario1.ID) - Number(scenario2.ID),
    ),
  );
}

export function formatNumber(
  cost: number,
  t: (s: any, c: any) => string,
): string {
  function getTranslationWithCorrectUnit(
    costValue: number,
    threshold: number,
    unit: string,
  ): string {
    return t(`riskMatrix.estimatedRisk.suffix.${unit}`, {
      count: Number(((costValue / threshold) * 1000).toFixed(0)),
    });
  }

  if (cost < 1e4) {
    return formatNOK(cost);
  }
  if (cost < 1e6) {
    return getTranslationWithCorrectUnit(cost, 1e6, 'thousand');
  }
  if (cost < 1e9) {
    return getTranslationWithCorrectUnit(cost, 1e9, 'million');
  }
  if (cost < 1e12) {
    return getTranslationWithCorrectUnit(cost, 1e12, 'billion');
  }
  return getTranslationWithCorrectUnit(cost, 1e15, 'trillion');
}

export function parseISODateFromEncryptedROS(date?: string): string | null {
  // Early return if date is null, could happen from recursion
  if (!date) {
    return null;
  }
  try {
    return formatISO(date);
  } catch (e) {
    if (e instanceof RangeError) {
      // Could not parse string to date
      // Sometimes this is because SOPS saved the date with ekstra escaped quotations: \"date\"
      // Trim the string and try again
      return parseISODateFromEncryptedROS(date.substring(1, date.length - 1));
    }
    return null;
  }
}

export function getTranslationKey(
  type: string,
  key: string,
  t: (s: any) => string,
): string {
  if (type === 'error') {
    return t([`errorMessages.${key}`, 'errorMessages.DefaultErrorMessage']);
  }
  return t(`infoMessages.${key}`);
}

export function gcpProjectIdToReadableString(gcpProjectId: string) {
  const parts = gcpProjectId.split('-');
  parts.pop();
  return parts.join('-');
}

export function isPublicAgeKeyValid(publicAgeKey: string) {
  if (publicAgeKey.length !== 62) {
    return false;
  }

  if (!publicAgeKey.startsWith('age1')) {
    return false;
  }

  const ageKeyRegex = /^age1[ac-hj-np-z02-9]{58}$/;
  return ageKeyRegex.test(publicAgeKey);
}

export interface Duration {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getPullRequestSecondaryText(
  fromDate: Date,
  userName: string,
  t: (s: any) => string,
) {
  const now = new Date();
  const diffMilliseconds = now.getTime() - fromDate.getTime();

  const seconds = Math.floor(diffMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months =
    now.getUTCMonth() -
    fromDate.getUTCMonth() +
    (now.getUTCFullYear() - fromDate.getUTCFullYear()) * 12;

  const text = t('sopsConfigDialog.secondaryPullRequestText');

  // Rounding up (like GitHub?)
  if (months > 0) {
    return `${text.replace(
      '_n_',
      `${months} ${
        months > 1 ? t('dictionary.months') : t('dictionary.month')
      }`,
    )} ${userName}`;
  }
  if (weeks > 0) {
    return `${text.replace(
      '_n_',
      `${weeks} ${weeks > 1 ? t('dictionary.weeks') : t('dictionary.week')}`,
    )} ${userName}`;
  }
  if (days > 0) {
    const remainingHours = hours % 24;
    const adjustedDays = remainingHours >= 12 ? days + 1 : days;
    return `${text.replace(
      '_n_',
      `${adjustedDays} ${
        adjustedDays > 1 ? t('dictionary.days') : t('dictionary.day')
      }`,
    )} ${userName}`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    const adjustedHours = remainingMinutes >= 30 ? hours + 1 : hours;
    return `${text.replace(
      '_n_',
      `${adjustedHours} ${
        adjustedHours > 1 ? t('dictionary.hours') : t('dictionary.hour')
      }`,
    )} ${userName}`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    const adjustedMinutes = remainingSeconds >= 30 ? minutes + 1 : minutes;
    return `${text.replace(
      '_n_',
      `${adjustedMinutes} ${
        adjustedMinutes > 1 ? t('dictionary.minutes') : t('dictionary.minute')
      }`,
    )} ${userName}`;
  }
  return `${text.replace(
    '_n_',
    `${seconds} ${
      seconds > 1 ? t('dictionary.seconds') : t('dictionary.second')
    }`,
  )} ${userName}`;
}

export function deleteScenario(
  riSc: RiScWithMetadata | null,
  updateRiSc: (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void,
  scenario: Scenario,
) {
  if (riSc) {
    const updatedScenarios = riSc.content.scenarios.filter(
      s => s.ID !== scenario.ID,
    );
    updateRiSc({
      ...riSc,
      content: { ...riSc.content, scenarios: updatedScenarios },
    });
  }
}

export function deleteAction(
  remove: (index?: number | number[]) => void,
  index: number,
  onSubmit: () => void,
) {
  remove(index);
  onSubmit();
}

/**
 * A recursive method for determining if a and b are deeply equal. Keys in the ignoredKeys argument are ignored in the
 * comparison, i.e., they are considered non-existing in both a and b.
 */
export function isDeeplyEqual<T>(
  a: T,
  b: T,
  ignoredKeys: string[] = [],
): boolean {
  // If objects are equal, there is no need compare them any further.
  if (a === b) return true;

  // Only do comparison on objects, ignoring null (which maps to object).
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Check if a and b are both arrays or not. If only one is, then a and b are not equal. It is necessary to perform
    // this check, as otherwise the method below will say that [] and {} are equal (or [0] and {0: 0}).
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    // Check if a and b have the same number of entries
    if (
      Object.keys(a).filter(key => !ignoredKeys.includes(key)).length !==
      Object.keys(b).filter(key => !ignoredKeys.includes(key)).length
    )
      return false;

    // Check if every key of a is a key of b and that the entry associated with the key is deeply the same in a and b.
    // Since a and b has the same number of entries, it is sufficient to check only the keys of a.
    return Object.entries(a).every(
      ([key, value]) =>
        ignoredKeys.includes(key) ||
        (Object.hasOwn(b, key as keyof T) &&
          isDeeplyEqual(value, b[key as keyof T])),
    );
  }

  // If a or b is null or a primitive type, then they are not equal as a === b should have returned true already.
  return false;
}

function logBase(value: number, base: number): number {
  return Math.log(value) / Math.log(base);
}

/*
  Probability is categorized in 5 levels on a logarithmic scale with base 20:
  0 = 20^-2 = 1 / 400
  1 = 20^-1 = 1 / 20
  2 = 20^-0 = 1
  3 = 20^1  = 20
  4 = 20^2  = 400
*/
export function findProbabilityIndex(probability: number): number {
  const probabilityIndex = Math.round(logBase(probability, BASE_NUMBER) + 2);
  return Math.min(4, Math.max(0, probabilityIndex));
}

/*
  Consequence  is categorized in 5 levels on a logarithmic scale with base 20:
  0 = 20^3 = 8 000
  1 = 20^4 = 160 000
  2 = 20^5 = 3 200 000
  3 = 20^6 = 64 000 000
  4 = 20^7 = 1 280 000 000
*/
export function findConsequenceIndex(consequence: number): number {
  const consequenceIndex = Math.round(logBase(consequence, BASE_NUMBER) - 3);
  return Math.min(4, Math.max(0, consequenceIndex));
}

/*
  Logarithmically round the consequence to the nearest consequence option.
*/
export function roundConsequenceToNearestConsequenceOption(
  consequence: number,
): number {
  return Math.pow(BASE_NUMBER, findConsequenceIndex(consequence) + 3);
}

/*
  Logarithmically round the probability to the nearest probability option.
*/
export function roundProbabilityToNearestProbabilityOption(
  probability: number,
): number {
  return Math.pow(BASE_NUMBER, findProbabilityIndex(probability) - 2);
}

export const consequenceIndexToTranslationKeys: Record<number, string> = {
  0: 'infoDialog.consequenceDescription.oneworkday',
  1: 'infoDialog.consequenceDescription.oneworkmonth',
  2: 'infoDialog.consequenceDescription.oneworkyear',
  3: 'infoDialog.consequenceDescription.20workyears',
  4: 'infoDialog.consequenceDescription.400workyears',
};

export const probabilityIndexToTranslationKeys: Record<number, string> = {
  0: 'infoDialog.probabilityDescription.every400years',
  1: 'infoDialog.probabilityDescription.every20years',
  2: 'infoDialog.probabilityDescription.annualy',
  3: 'infoDialog.probabilityDescription.monthly',
  4: 'infoDialog.probabilityDescription.daily',
};

export const actionStatusOptionsToTranslationKeys: Record<
  ActionStatusOptions,
  string
> = {
  [ActionStatusOptions.NotStarted]: 'actionStatus.Not started',
  [ActionStatusOptions.InProgress]: 'actionStatus.In progress',
  [ActionStatusOptions.OnHold]: 'actionStatus.On hold',
  [ActionStatusOptions.Completed]: 'actionStatus.Completed',
  [ActionStatusOptions.Aborted]: 'actionStatus.Aborted',
};

export const threatActorOptionsToTranslationKeys: Record<
  ThreatActorsOptions,
  string
> = {
  [ThreatActorsOptions.ScriptKiddie]: 'threatActors.Script kiddie',
  [ThreatActorsOptions.Hacktivist]: 'threatActors.Hacktivist',
  [ThreatActorsOptions.RecklessEmployee]: 'threatActors.Reckless employee',
  [ThreatActorsOptions.Insider]: 'threatActors.Insider',
  [ThreatActorsOptions.OrganisedCrime]: 'threatActors.Organised crime',
  [ThreatActorsOptions.TerroristOrganisation]:
    'threatActors.Terrorist organisation',
  [ThreatActorsOptions.NationGovernment]: 'threatActors.Nation/government',
};

export const vulnerabiltiesOptionsToTranslationKeys: Record<
  VulnerabilitiesOptions,
  string
> = {
  [VulnerabilitiesOptions.FlawedDesign]: 'vulnerabilities.Flawed design',
  [VulnerabilitiesOptions.Misconfiguration]: 'vulnerabilities.Misconfiguration',
  [VulnerabilitiesOptions.DependencyVulnerability]:
    'vulnerabilities.Dependency vulnerability',
  [VulnerabilitiesOptions.UnauthorizedAccess]:
    'vulnerabilities.Unauthorized access',
  [VulnerabilitiesOptions.UnmonitoredUse]: 'vulnerabilities.Unmonitored use',
  [VulnerabilitiesOptions.InputTampering]: 'vulnerabilities.Input tampering',
  [VulnerabilitiesOptions.InformationLeak]: 'vulnerabilities.Information leak',
  [VulnerabilitiesOptions.ExcessiveUse]: 'vulnerabilities.Excessive use',
};
