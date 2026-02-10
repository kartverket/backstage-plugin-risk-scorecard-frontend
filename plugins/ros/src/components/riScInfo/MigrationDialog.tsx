import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { MigrationStatus, RiScWithMetadata } from '../../utils/types';
import { RiScMigrationChanges } from './migrations/RiScMigrationChanges.tsx';
import { Flex, Text } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';
import DialogComponent from '../dialog/DialogComponent.tsx';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import {
  usePopulatedMigrationStatus,
  usePopulatedRiSc,
} from '../../utils/frontendMigrationHelpers.ts';

interface RiScMigrationDialogProps {
  selectedRiSc: RiScWithMetadata;
  openDialog: boolean;
  migrationStatus: MigrationStatus;
  setMigrationDialogIsOpen: (newValue: boolean) => void;
}

export const RiScMigrationDialog = ({
  selectedRiSc,
  openDialog,
  migrationStatus,
  setMigrationDialogIsOpen,
}: RiScMigrationDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { updateRiSc } = useRiScs();

  const [saveMigration, setSaveMigration] = useState<boolean>(false);
  const populatedRiSc = usePopulatedRiSc(selectedRiSc);
  const populatedMigrationStatus = usePopulatedMigrationStatus(
    migrationStatus,
    populatedRiSc,
  );

  function handleCheckboxInput(event: React.ChangeEvent<HTMLInputElement>) {
    setSaveMigration(event.target.checked);
  }

  function closeDialog() {
    setMigrationDialogIsOpen(false);
  }

  const handleSaveMigration = () => {
    updateRiSc(populatedRiSc);
    setMigrationDialogIsOpen(false);
  };

  return (
    <DialogComponent
      isOpen={openDialog}
      onClick={closeDialog}
      header={t('migrationDialog.title')}
      className={styles.riScInfoDialog}
    >
      <Box sx={{ marginBottom: '16px' }}>
        <Text variant="body-large">{t('migrationDialog.description')}</Text>
      </Box>
      <RiScMigrationChanges migrationStatus={populatedMigrationStatus} />
      <Alert severity="info" icon={false}>
        <FormControlLabel
          control={
            <Checkbox checked={saveMigration} onChange={handleCheckboxInput} />
          }
          label={t('migrationDialog.checkboxLabel')}
        />
      </Alert>
      <Flex justify="between" pt="24px">
        <Button variant="outlined" color="primary" onClick={closeDialog}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveMigration}
          disabled={!saveMigration}
        >
          {t('dictionary.confirm')}
        </Button>
      </Flex>
    </DialogComponent>
  );
};
