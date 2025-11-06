import { Action } from './types.ts';
import { ActionStatusOptions } from './constants.ts';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  UpdatedStatusEnumType,
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
  const lastUpdatedBy =
    profileInfo?.displayName || profileInfo?.email || 'User User'; // TODO: remove User22 used for testing
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
  numberOfCommitsOnRisc: number | null,
): ActionWithUpdatedStatus[] {
  return actions.map(action => {
    const daysSinceLastUpdate = action.lastUpdated
      ? calculateDaysSince(new Date(action.lastUpdated))
      : null;
    return {
      ...action,
      updatedStatus: calculateUpdatedStatus(
        daysSinceLastUpdate,
        numberOfCommitsOnRisc,
      ),
    } as ActionWithUpdatedStatus;
  });
}

export function getFilteredActions(
  actions: ActionWithUpdatedStatus[],
  searchMatches: Action[] | undefined,
  idsOfActionsMatchingUpdatedStatus: string[],
  updatedStatusFilter: UpdatedStatusEnumType | null,
): ActionWithUpdatedStatus[] {
  if (updatedStatusFilter === null && searchMatches === undefined) return [];
  if (updatedStatusFilter === null) {
    return actions.filter(a => {
      if (searchMatches === undefined) return true;
      return searchMatches?.find(aa => a.ID === aa.ID);
    });
  }
  return actions
    .filter(a => idsOfActionsMatchingUpdatedStatus.includes(a.ID))
    .filter(a => {
      if (searchMatches === undefined) return true;
      return searchMatches?.find(aa => a.ID === aa.ID);
    });
}
