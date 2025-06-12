import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { MigrationStatus } from '../../utils/types';
import { dialogActions } from '../common/mixins';
import { RiScMigrationChanges } from './migrations/RiScMigrationChanges.tsx';

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
    <Dialog maxWidth="md" open={openDialog}>
      <DialogTitle>{t('migrationDialog.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ marginBottom: '16px' }}>
          <Typography>{t('migrationDialog.description')}</Typography>
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
      </DialogContent>
      <DialogActions sx={dialogActions} style={{ paddingTop: '16px' }}>
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
      </DialogActions>
    </Dialog>
  );
};
