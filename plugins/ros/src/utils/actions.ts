import { Action } from './types.ts';
import { ActionStatusOptions } from './constants.ts';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnumType,
  UpdatedStatusEnum,
} from './utilityfunctions.ts';
import { ProfileInfo } from '@backstage/core-plugin-api';

export function filterActionsByRelevance(
  actions: Action[],
  showOnlyRelevant: boolean,
) {
  return actions.filter(action =>
    showOnlyRelevant ? action.status !== ActionStatusOptions.NotRelevant : true,
  );
}

export function isActionsEqual(a: Action, b: Action) {
  if (
    a.ID !== b.ID ||
    a.title !== b.title ||
    a.description !== b.description ||
    a.status !== b.status ||
    a.url !== b.url
  )
    return false;

  if (a.lastUpdated === b.lastUpdated) return true;
  if (!a.lastUpdated || !b.lastUpdated) return false;
  return a.lastUpdated.getTime() === b.lastUpdated.getTime();
}

export function getActionsWithLastUpdated(
  oldActions: Action[],
  newActions: Action[],
  idsOfActionsToForceUpdateLastUpdatedValue: string[] = [],
  profileInfo?: ProfileInfo,
) {
  const actionsWithLastUpdated: Action[] = [];
  const lastUpdatedBy = profileInfo?.displayName || profileInfo?.email || '';
  for (const newAction of newActions) {
    if (idsOfActionsToForceUpdateLastUpdatedValue.includes(newAction.ID)) {
      actionsWithLastUpdated.push({
        ...newAction,
        lastUpdated: new Date(),
        lastUpdatedBy: lastUpdatedBy,
      });
      continue;
    }

    const oldAction = oldActions.find(a => a.ID === newAction.ID);
    if (oldAction && isActionsEqual(newAction, oldAction)) {
      actionsWithLastUpdated.push({ ...newAction });
    } else {
      actionsWithLastUpdated.push({
        ...newAction,
        lastUpdated: new Date(),
        lastUpdatedBy: lastUpdatedBy,
      });
    }
  }
  return actionsWithLastUpdated;
}

export type ActionWithUpdatedStatus = Action & {
  updatedStatus: UpdatedStatusEnumType;
};

export function getActionsWithUpdatedStatus(
  actions: Action[],
): ActionWithUpdatedStatus[] {
  return actions.map(action => {
    const daysSinceLastUpdate = action.lastUpdated
      ? calculateDaysSince(new Date(action.lastUpdated))
      : null;
    const updatedStatus =
      daysSinceLastUpdate !== null
        ? calculateUpdatedStatus(daysSinceLastUpdate)
        : UpdatedStatusEnum.VERY_OUTDATED;
    return {
      ...action,
      updatedStatus: updatedStatus,
    } as ActionWithUpdatedStatus;
  });
}

export function getUpdatedStatus(action: Action) {
  const daysSinceLastUpdate = action.lastUpdated
    ? calculateDaysSince(new Date(action.lastUpdated))
    : null;

  const status =
    daysSinceLastUpdate !== null
      ? calculateUpdatedStatus(daysSinceLastUpdate)
      : UpdatedStatusEnum.VERY_OUTDATED;
  return status;
}
