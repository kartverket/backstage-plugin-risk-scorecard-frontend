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
import {
  Text,
  DialogTrigger,
  Dialog as D,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';

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
    <DialogTrigger>
      <D isOpen={openDialog} className={styles.migrationDialog}>
        <DialogHeader>
          <Text variant="title-x-small" weight="bold">
            {t('migrationDialog.title')}
          </Text>
        </DialogHeader>
        <DialogBody>
          <Box sx={{ marginBottom: '16px' }}>
            <Text variant="body-large">{t('migrationDialog.description')}</Text>
          </Box>
          <RiScMigrationChanges migrationStatus={migrationStatus} />
          <Alert severity="info" icon={false}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveMigration}
                  onChange={handleCheckboxInput}
                />
              }
              label={t('migrationDialog.checkboxLabel')}
            />
          </Alert>
        </DialogBody>
        <DialogFooter className={styles.migrationDialogFooter}>
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
        </DialogFooter>
      </D>
    </DialogTrigger>
  );
};
