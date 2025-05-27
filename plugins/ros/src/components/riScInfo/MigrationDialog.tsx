import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { MigrationStatus } from '../../utils/types';
import { dialogActions } from '../common/mixins';
import { URLS } from '../../urls';
import { RiScMigrationChanges41 } from './migrations/RiScMigrationChanges41.tsx';
import { ChangeSetBox } from './migrations/components/ChangeSetBox.tsx';
import { ChangeSetTitle } from './migrations/components/ChangeSetTitle.tsx';
import { ChangeSetChangedValue } from './migrations/components/ChangeSetChangedValue.tsx';

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
          <Typography>
            {t('migrationDialog.description')}
            {migrationStatus.migrationVersions?.toVersion}{' '}
            {t('migrationDialog.description2')}{' '}
            {migrationStatus.migrationVersions?.fromVersion}
            {t('migrationDialog.description3')}
            <Link
              underline="always"
              target="_blank"
              href={URLS.external.github_com__kartverket_changelog}
            >
              {t('migrationDialog.changelog')}
            </Link>{' '}
            {t('migrationDialog.description4')}
          </Typography>
        </Box>
        <div>
          <ChangeSetTitle text="Schema Version" />
          <ChangeSetBox type="primary">
            <ChangeSetChangedValue
              property="Schema version"
              oldValue={migrationStatus.migrationVersions?.fromVersion || ''}
              newValue={migrationStatus.migrationVersions?.toVersion || ''}
            />
          </ChangeSetBox>
          {migrationStatus.migrationChanges41 && (
            <RiScMigrationChanges41
              changes={migrationStatus.migrationChanges41}
            />
          )}
        </div>
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
      <DialogActions sx={dialogActions}>
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
