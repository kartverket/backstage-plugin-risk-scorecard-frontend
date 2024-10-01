import React, { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Input } from '../common/Input';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import { RiScDialogStates } from './RiScDialog';
import { Error } from '@mui/icons-material';
import { useAuthenticatedFetch } from '../../utils/hooks';
import { PublicAgeKeyDTO, publicAgeKeyToDTO } from '../../utils/DTOs';

interface GenerateRiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
}

export const GenerateRiscDialog = ({
  onClose,
  dialogState,
}: GenerateRiScDialogProps) => {
  const { generateRiSc } = useAuthenticatedFetch();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [publicAgeKey, setPublicAgeKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validateInput = (ageKey: string) => {
    if (ageKey === '') {
      return true;
    }
    if (!ageKey.startsWith('age')) {
      setError(t('generateRiSc.error'));
      return false;
    }
    setError('');
    return true;
  };

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPublicAgeKey(event.target.value);
  };

  const onSubmit = (publicAgeKey: string) => {
    if (validateInput(publicAgeKey)) {
      const publicAgeKeyDTO = publicAgeKeyToDTO(
        publicAgeKey,
      ) as PublicAgeKeyDTO;
      generateRiSc(publicAgeKeyDTO);
      onClose();
      // TODO : Hvordan skal vi håndtere dette?
    }
  };

  return (
    <Dialog open={dialogState !== RiScDialogStates.Closed} onClose={onClose}>
      <DialogTitle>{t('generateRiSc.title')}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Input
          sublabel={t('generateRiSc.description')}
          onChange={handleChangeInput}
          value={publicAgeKey}
          placeholder={t('generateRiSc.placeholder')}
        />
      </DialogContent>

      <DialogActions sx={dialogActions}>
        {error && (
          <>
            <Error color="error" />
            <DialogContent
              sx={{
                color: 'red',
                display: 'flex',
                flexDirection: 'row',
                maxHeight: '4px',
                overflow: 'hidden',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              {error}
            </DialogContent>
          </>
        )}
        <Button variant="contained" onClick={() => onSubmit(publicAgeKey)}>
          {t('generateRiSc.button')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
