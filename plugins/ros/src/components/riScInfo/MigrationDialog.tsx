import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { MigrationStatus } from '../../utils/types';
import { RiScMigrationChanges } from './migrations/RiScMigrationChanges.tsx';
import { Text, Box } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';
import { ConfirmationDialogWithCheckbox } from '../common/ConfirmationDialog.tsx';

interface RiScMigrationDialogProps {
  openDialog: boolean;
  handleCancel: () => void;
  handleUpdate: () => void;
  migrationStatus: MigrationStatus;
}

export const RiScMigrationDialog = ({
  openDialog,
  handleCancel,
  handleUpdate,
  migrationStatus,
}: RiScMigrationDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialogWithCheckbox
      isOpen={openDialog}
      onCancel={handleCancel}
      onConfirm={handleUpdate}
      title={t('migrationDialog.title')}
      checkboxLabel={t('migrationDialog.checkboxLabel')}
      className={styles.riScInfoDialog}
    >
      <Box className={styles.riscDescriptionContainer}>
        <Text variant="body-large">{t('migrationDialog.description')}</Text>
      </Box>
      <RiScMigrationChanges migrationStatus={migrationStatus} />
    </ConfirmationDialogWithCheckbox>
  );
};
