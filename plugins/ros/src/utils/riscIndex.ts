import type { LockedRiSc, RiScWithMetadata, SystemRiSc } from './types';

export function getSystemRiScsNotInSelector(
  systemRiScs: SystemRiSc[],
  riScs: RiScWithMetadata[] | null,
  lockedRiScs: LockedRiSc[],
): SystemRiSc[] {
  const existingRiScIds = new Set([
    ...(riScs ?? []).map(riSc => riSc.id),
    ...lockedRiScs.map(riSc => riSc.id),
  ]);

  return systemRiScs.filter(systemRiSc => {
    return !existingRiScIds.has(systemRiSc.id);
  });
}
