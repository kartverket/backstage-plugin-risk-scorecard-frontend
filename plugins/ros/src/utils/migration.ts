/**
 * Some migrations require the frontend to populate the new RISC schema with
 * data that is only available on the frontend. The functions responsible for
 * providing this data are defined in this file.
 */
import { MigrationStatus, RiScWithMetadata } from './types.ts';
import { useBackstageContext } from '../contexts/BackstageContext.tsx';

export function useMigratedRiSc(riSc: RiScWithMetadata): RiScWithMetadata {
  const { entityRef } = useBackstageContext();

  const migratedRiSc = structuredClone(riSc);
  addRiScDataFor53Migration(migratedRiSc, entityRef);
  return migratedRiSc;
}

function addRiScDataFor53Migration(
  riSc: RiScWithMetadata,
  entityRef: string | undefined,
) {
  riSc.content.metadata.backstage.entityRef = entityRef || '';
}

export function useMigratedMigrationStatus(
  migrationStatus: MigrationStatus,
  migratedRiSc: RiScWithMetadata,
) {
  const migratedMigrationStatus = structuredClone(migrationStatus);
  addMigrationStatusDataFor53Migration(migratedMigrationStatus, migratedRiSc);
  return migratedMigrationStatus;
}

function addMigrationStatusDataFor53Migration(
  migrationStatus: MigrationStatus,
  migratedRiSc: RiScWithMetadata,
) {
  if (migrationStatus.migrationChanges53) {
    migrationStatus.migrationChanges53.metadataUnencrypted =
      migratedRiSc.content.metadata;
  }
}
