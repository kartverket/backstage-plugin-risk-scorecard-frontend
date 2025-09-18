// Type definitions
import { useState } from 'react';

type ActionFilters = {
  showOnlyRelevant: boolean;
};

// Constants
const LOCAL_STORAGE_KEY = 'actionFilters';

const DEFAULT_ACTION_FILTERS: ActionFilters = {
  showOnlyRelevant: false,
};

// Functions
let getActionFilters = (): ActionFilters => {
  let storage = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storage === null) return DEFAULT_ACTION_FILTERS;

  const storageJson = JSON.parse(storage);

  return {
    showOnlyRelevant:
      storageJson.showOnlyRelevant ?? DEFAULT_ACTION_FILTERS.showOnlyRelevant,
  };
};

let storeActionFilters = (actionFilters: ActionFilters) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actionFilters));
};

// Exported Hook
export function useActionFiltersStorage() {
  const [actionFilters, setActionFilters] = useState(() => getActionFilters());

  let saveOnlyRelevantFilter = (isVisible: boolean) => {
    const newActionFilters = { ...actionFilters, showOnlyRelevant: isVisible };
    storeActionFilters(newActionFilters);
    setActionFilters(newActionFilters);
  };

  let clearActionFilters = () => {
    localStorage.clear();
  };

  return {
    actionFilters,
    saveOnlyRelevantFilter,
    clearActionFilters,
  };
}
