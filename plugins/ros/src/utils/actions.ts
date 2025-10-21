import { Action } from './types.ts';
import { ActionStatusOptions } from './constants.ts';

export function filterActionsByRelevance(
  actions: Action[],
  showOnlyRelevant: boolean,
) {
  return actions.filter(action =>
    showOnlyRelevant ? action.status !== ActionStatusOptions.NotRelevant : true,
  );
}
