import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { MigrationStatus } from '../../utils/types';
import { RiScMigrationChanges } from './migrations/RiScMigrationChanges.tsx';
import { Flex, Text } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';
import DialogComponent from '../dialog/DialogComponent.tsx';

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

  const [saveMigration, setSaveMigration] = useState<boolean>(false);

  function handleCheckboxInput(event: React.ChangeEvent<HTMLInputElement>) {
    setSaveMigration(event.target.checked);
  }

  return (
    <DialogComponent
      isOpen={openDialog}
      onClick={handleCancel}
      header={t('migrationDialog.title')}
      className={styles.riScInfoDialog}
    >
      <Box sx={{ marginBottom: '16px' }}>
        <Text variant="body-large">{t('migrationDialog.description')}</Text>
      </Box>
      <RiScMigrationChanges migrationStatus={migrationStatus} />
      <Alert severity="info" icon={false}>
        <FormControlLabel
          control={
            <Checkbox checked={saveMigration} onChange={handleCheckboxInput} />
          }
          label={t('migrationDialog.checkboxLabel')}
        />
      </Alert>
      <Flex justify="between" pt="24px">
        <Button variant="outlined" color="primary" onClick={handleCancel}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={!saveMigration}
        >
          {t('dictionary.confirm')}
        </Button>
      </Flex>
    </DialogComponent>
  );
};
