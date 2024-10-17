import React, { useEffect, useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Input } from '../common/Input';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { dialogActions } from '../common/mixins';
import { RiScDialogStates } from './RiScDialog';
import { Error } from '@mui/icons-material';
import { useAuthenticatedFetch } from '../../utils/hooks';
import { generateRiScToDTO, GenerateRiScDTO } from '../../utils/DTOs';

interface GenerateRiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
  setInitialRiScHasBeenGenerated: (value: boolean) => void;
}

export const GenerateRiscDialog = ({
  onClose,
  dialogState,
  setInitialRiScHasBeenGenerated,
}: GenerateRiScDialogProps) => {
  const { generateRiSc, fetchProjectIds } = useAuthenticatedFetch();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [publicAgeKey, setPublicAgeKey] = useState<string>('');
  const [GCPProjectId, setGCPprojectId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [projectIds, setProjectIds] = useState<Record<string, string>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchProjectIds().then(
      (response: string[]) => {
        const projectIdMap = response.reduce((acc, it) => {
          const lastDashIndex = it.lastIndexOf('-');
          const formattedKey =
            lastDashIndex !== -1 ? it.slice(0, lastDashIndex) : it;
          acc[formattedKey] = it;
          return acc;
        }, {} as Record<string, string>);

        setProjectIds(projectIdMap);
      },
      () => {
        setProjectIds({});
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once

  const validatePublicAgeKeyInput = (ageKey: string) => {
    if (ageKey === '') {
      return true;
    }
    if (!ageKey.startsWith('age')) {
      setError(t('generateRiSc.errorPublicAgeKey'));
      return false;
    }
    return true;
  };

  const validateGCPProjectIdInput = (projectId: string) => {
    if (projectId === '') {
      setError(t('generateRiSc.errorGCPprojectId'));
      return false;
    }
    return true;
  };

  const handleChangePublicAgeKeyInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPublicAgeKey(event.target.value);
  };

  const handleChangeGcpProjectIdInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGCPprojectId(event.target.value);
  };

  const onSubmit = () => {
    if (
      validatePublicAgeKeyInput(publicAgeKey) &&
      validateGCPProjectIdInput(GCPProjectId)
    ) {
      const generateRiScDTO = generateRiScToDTO(
        GCPProjectId,
        publicAgeKey,
      ) as GenerateRiScDTO;
      generateRiSc(generateRiScDTO);

      // TODO : Hvordan skal vi håndtere dette?
      setInitialRiScHasBeenGenerated(true);
      onClose();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        {Object.entries(projectIds).length > 0 ? (
          <>
            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              {t('generateRiSc.selectGCPprojectId')}
            </Button>
            <Menu
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              {Object.entries(projectIds).map(
                ([formattedProjectId, projectId]) => (
                  <MenuItem
                    key={projectId}
                    onClick={() => setGCPprojectId(projectId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {formattedProjectId}
                  </MenuItem>
                ),
              )}
            </Menu>
          </>
        ) : (
          <div style={{ alignItems: 'center', display: 'flex' }}>
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
              {t('generateRiSc.errorContactAdmin')}
            </DialogContent>
          </div>
        )}

        <Input
          label={t('generateRiSc.GCPprojectId')}
          onChange={handleChangeGcpProjectIdInput}
          value={Object.keys(projectIds).find(
            key => projectIds[key] === GCPProjectId,
          )}
          placeholder={t('generateRiSc.placeholderGCPprojectId')}
          required
          disabled
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
          disabled={GCPProjectId === ''}
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
