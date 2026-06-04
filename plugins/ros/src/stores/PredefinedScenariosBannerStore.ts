// Per-RiSc dismissal state for the (temporary) predefined-scenarios banner.
import { useState } from 'react';

const LOCAL_STORAGE_KEY = 'predefinedScenariosBannerDismissed';

const getDismissedRiScIds = (): string[] => {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storage === null) return [];

  try {
    const parsed = JSON.parse(storage);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
};

const storeDismissedRiScIds = (ids: string[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
};

export function usePredefinedScenariosBannerDismissal(riScId: string) {
  const [dismissedRiScIds, setDismissedRiScIds] = useState(() =>
    getDismissedRiScIds(),
  );

  const isDismissed = dismissedRiScIds.includes(riScId);

  const dismiss = () => {
    if (dismissedRiScIds.includes(riScId)) return;
    const updated = [...dismissedRiScIds, riScId];
    storeDismissedRiScIds(updated);
    setDismissedRiScIds(updated);
  };

  return {
    isDismissed,
    dismiss,
  };
}
