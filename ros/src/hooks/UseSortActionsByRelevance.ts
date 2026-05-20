import { useCallback } from 'react';
import { Action } from '../utils/types.ts';
import { ActionStatusOptions } from '../utils/constants.ts';

export function useSortActionsByRelevance() {
  return useCallback((actions: Action[]) => {
    return [...actions].sort((a, b) => {
      const aIsNotRelevant = a.status === ActionStatusOptions.NotRelevant;
      const bIsNotRelevant = b.status === ActionStatusOptions.NotRelevant;

      if (aIsNotRelevant && !bIsNotRelevant) {
        return 1;
      }
      if (!aIsNotRelevant && bIsNotRelevant) {
        return -1;
      }
      return 0;
    });
  }, []);
}
