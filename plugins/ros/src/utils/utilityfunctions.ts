import { RiSc, RiScWithMetadata, Risk, Scenario } from './types';
import {
  consequenceOptions,
  latestSupportedVersion,
  probabilityOptions,
  riskMatrix,
} from './constants';
import { formatISO } from 'date-fns';
import { UpdateStatus } from '../contexts/RiScContext';

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
  const sannsynlighet = probabilityOptions.indexOf(risiko.probability);
  const konsekvens = consequenceOptions.indexOf(risiko.consequence);
  return riskMatrix[4 - konsekvens][sannsynlighet];
}

export const getProbabilityLevel = (risiko: Risk) =>
  probabilityOptions.indexOf(risiko.probability) + 1;

export const getConsequenceLevel = (risiko: Risk) =>
  consequenceOptions.indexOf(risiko.consequence) + 1;

export const emptyRiSc = (): RiSc => ({
  schemaVersion: latestSupportedVersion,
  title: '',
  scope: '',
  valuations: [],
  scenarios: [],
});

export function arrayNotEquals<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) {
    return true;
  }
  return array1.reduce((returnValue, currentElement, index) => {
    if (currentElement !== array2[index]) {
      return true;
    }
    return returnValue;
  }, false);
}

// keys that does not change the approval status: tittel, beskrivelse, oppsummering, tiltak.beskrivelse, tiltak.tiltakseier, tiltak.status
export const requiresNewApproval = (
  oldRiSc: RiSc,
  updatedRiSc: RiSc,
): boolean => {
  if (oldRiSc.scenarios.length !== updatedRiSc.scenarios.length) {
    return true;
  }
  let requiresApproval = false;

  const updatedScenarioMap = new Map<string, Scenario>(
    updatedRiSc.scenarios.map(scenario => [scenario.ID, scenario]),
  );

  oldRiSc.scenarios.forEach(oldScenario => {
    const updatedScenario = updatedScenarioMap.get(oldScenario.ID);

    if (!updatedScenario) {
      requiresApproval = true;
      return;
    }

    if (
      arrayNotEquals(oldScenario.threatActors, updatedScenario.threatActors)
    ) {
      requiresApproval = true;
    }

    if (
      arrayNotEquals(
        oldScenario.vulnerabilities,
        updatedScenario.vulnerabilities,
      )
    ) {
      requiresApproval = true;
    }

    if (oldScenario.risk.probability !== updatedScenario.risk.probability) {
      requiresApproval = true;
    }

    if (oldScenario.risk.consequence !== updatedScenario.risk.consequence) {
      requiresApproval = true;
    }

    if (oldScenario.actions.length !== updatedScenario.actions.length) {
      requiresApproval = true;
    }
    if (
      oldScenario.remainingRisk.probability !==
      updatedScenario.remainingRisk.probability
    ) {
      requiresApproval = true;
    }
    if (
      oldScenario.remainingRisk.consequence !==
      updatedScenario.remainingRisk.consequence
    ) {
      requiresApproval = true;
    }
  });
  return requiresApproval;
};

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

export const deleteScenario = (
  riSc: RiScWithMetadata | null,
  updateRiSc: (
    riSc: RiScWithMetadata,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void,
  scenario: Scenario,
) => {
  if (riSc) {
    const updatedScenarios = riSc.content.scenarios.filter(
      s => s.ID !== scenario.ID,
    );
    updateRiSc({
      ...riSc,
      content: { ...riSc.content, scenarios: updatedScenarios },
    });
  }
};

export const deleteAction = (
  remove: (index?: number | number[]) => void,
  index: number,
  onSubmit: () => void,
) => {
  remove(index);
  onSubmit();
};

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
