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
import { generateRiScToDTO, GenerateRiScDTO } from '../../utils/DTOs';
import { DialogContentText } from '@mui/material';

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
  const [gcpTeamKey, setGcpTeamKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const validatePublicAgeKeyInput = (ageKey: string) => {
    if (ageKey === '') {
      return true;
    }
    if (!ageKey.startsWith('age')) {
      setError(t('generateRiSc.errorPublicAgeKey'));
      return false;
    }
    setError('');
    return true;
  };

  const validateGcpTeamKeyInput = (teamKey: string) => {
    const mustContain = (str: string, ...substrings: string[]) => {
      return substrings.every(substring => str.includes(substring));
    };
    if (
      !mustContain(
        teamKey,
        'projects/',
        '/locations/global/keyRings/',
        '/cryptoKeys/',
      ) &&
      teamKey !== ''
    ) {
      setError(t('generateRiSc.errorGcpTeamKey'));
      return false;
    }
    setError('');
    return true;
  };

  const handleChangePublicAgeKeyInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPublicAgeKey(event.target.value);
  };

  const handleChangeGcpTeamKeyInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGcpTeamKey(event.target.value);
  };

  const onSubmit = () => {
    if (
      validatePublicAgeKeyInput(publicAgeKey) &&
      validateGcpTeamKeyInput(gcpTeamKey)
    ) {
      const generateRiScDTO = generateRiScToDTO(
        gcpTeamKey,
        publicAgeKey,
      ) as GenerateRiScDTO;
      generateRiSc(generateRiScDTO);
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
        <DialogContentText>{t('generateRiSc.description')}</DialogContentText>
        <Input
          label={t('generateRiSc.publicAgeKey')}
          onChange={handleChangePublicAgeKeyInput}
          value={publicAgeKey}
          placeholder={t('generateRiSc.placeholderPublicAgeKey')}
        />
        <Input
          label={t('generateRiSc.gcpTeamKey')}
          onChange={handleChangeGcpTeamKeyInput}
          value={gcpTeamKey}
          placeholder={t('generateRiSc.placeholderGcpTeamKey')}
          required
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
        <Button
          variant="contained"
          onClick={() => onSubmit()}
          disabled={gcpTeamKey === ''}
        >
          {t('generateRiSc.button')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
