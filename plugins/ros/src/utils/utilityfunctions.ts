import { RiSc, Risk, Scenario } from './types';
import {
  consequenceOptions,
  latestSupportedVersion,
  probabilityOptions,
  riskMatrix,
} from './constants';
import { formatISO } from 'date-fns';
import { UpdateStatus } from '../contexts/RiScContext';
import { pluginRiScTranslationRef } from './translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

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
  if (publicAgeKey.length != 62) {
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

export function getPullRequestSecondaryText(fromDate: Date, userName: string) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const now = new Date();

  const years = now.getUTCFullYear() - fromDate.getUTCFullYear();
  const months = now.getUTCMonth() - fromDate.getUTCMonth() + years * 12;

  const normalizedFromDate = new Date(fromDate);
  normalizedFromDate.setUTCMonth(now.getUTCMonth(), now.getUTCDate());

  let days = Math.floor(
    (now.getTime() - normalizedFromDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Adjust month differences if the current day is before the fromDate day.
  if (days < 0) {
    const dayAdjustmentDate = new Date(normalizedFromDate);
    dayAdjustmentDate.setMonth(now.getMonth() - 1);
    days = Math.floor(
      (now.getTime() - dayAdjustmentDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  // Weeks can be extracted from days
  const weeks = Math.floor(days / 7);
  days = days % 7;

  // Remaining time
  let remainder =
    now.getTime() -
    normalizedFromDate.getTime() -
    (weeks * 7 + days) * 24 * 60 * 60 * 1000;
  const hours = Math.floor(remainder / (1000 * 60 * 60));
  remainder -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(remainder / (1000 * 60));
  remainder -= minutes * 1000 * 60;
  const seconds = Math.floor(remainder / 1000);

  const text = t('sopsConfigDialog.secondaryPullRequestText');

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
    return `${text.replace(
      '_n_',
      `${days} ${days > 1 ? t('dictionary.days') : t('dictionary.day')}`,
    )} ${userName}`;
  }
  if (hours > 0) {
    return `${text.replace(
      '_n_',
      `${hours} ${hours > 1 ? t('dictionary.hours') : t('dictionary.hour')}`,
    )} ${userName}`;
  }
  if (minutes > 0) {
    return `${text.replace(
      '_n_',
      `${minutes} ${
        minutes > 1 ? t('dictionary.minutes') : t('dictionary.minute')
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
