/**
 * Some migrations require the frontend to populate the new RISC schema with
 * data that is only available on the frontend. The functions responsible for
 * providing this data are defined in this file.
 */
import { MigrationStatus, RiScWithMetadata } from './types.ts';
import { useBackstageContext } from '../contexts/BackstageContext.tsx';

export function usePopulatedRiSc(riSc: RiScWithMetadata): RiScWithMetadata {
  const { entityRef } = useBackstageContext();

  const populatedRiSc = structuredClone(riSc);
  populateRiScForMigration53(populatedRiSc, entityRef);
  return populatedRiSc;
}

/** Adds entityRef to RiSc */
function populateRiScForMigration53(
  riSc: RiScWithMetadata,
  entityRef: string | undefined,
) {
  riSc.content.metadata.backstage.entityRef = entityRef || '';
}

export function usePopulatedMigrationStatus(
  migrationStatus: MigrationStatus,
  populatedRiSc: RiScWithMetadata,
) {
  const populatedMigrationStatus = structuredClone(migrationStatus);
  populateMigrationStatusForMigration53(
    populatedMigrationStatus,
    populatedRiSc,
  );
  return populatedMigrationStatus;
}

function populateMigrationStatusForMigration53(
  migrationStatus: MigrationStatus,
  populatedRiSc: RiScWithMetadata,
) {
  if (migrationStatus.migrationChanges53) {
    migrationStatus.migrationChanges53.metadataUnencrypted =
      populatedRiSc.content.metadata;
  }
}
