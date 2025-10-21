import { useEffect, useMemo, useState } from 'react';

export function useFilteredActions<
  Action extends { ID: string; updatedStatus: UpdatedStatusEnumType },
  UpdatedStatusEnumType extends string | number,
>({
  visibleType,
  actionsWithUpdatedStatus,
  searchMatches,
}: {
  visibleType: UpdatedStatusEnumType | null;
  actionsWithUpdatedStatus: (Action & {
    updatedStatus: UpdatedStatusEnumType;
  })[];
  searchMatches?: { ID: string }[] | null;
}) {
  const [displayedActions, setDisplayedActions] = useState<
    (Action & { updatedStatus: UpdatedStatusEnumType })[]
  >([]);
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => {
    if (visibleType === null) {
      setDisplayedActions([]);
      setFilterActive(false);
      return;
    }

    if (!filterActive) {
      const filtered = actionsWithUpdatedStatus.filter(
        a => a.updatedStatus === visibleType,
      );
      setDisplayedActions(filtered);
      setFilterActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleType]);

  const finalDisplayedActions = useMemo(() => {
    if (searchMatches && searchMatches.length > 0) {
      return searchMatches
        .map(sm => actionsWithUpdatedStatus.find(action => action.ID === sm.ID))
        .filter(
          (
            action,
          ): action is Action & { updatedStatus: UpdatedStatusEnumType } =>
            !!action,
        );
    }

    if (filterActive && visibleType !== null) {
      return displayedActions;
    }

    return [];
  }, [
    searchMatches,
    actionsWithUpdatedStatus,
    displayedActions,
    filterActive,
    visibleType,
  ]);

  return finalDisplayedActions;
}
