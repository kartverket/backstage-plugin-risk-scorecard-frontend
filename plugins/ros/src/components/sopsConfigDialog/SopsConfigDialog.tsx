import Dialog from '@mui/material/Dialog';
import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import { isPublicAgeKeyValid } from '../../utils/utilityfunctions';
import DialogContent from '@mui/material/DialogContent';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AddCircle from '@mui/icons-material/AddCircle';
import { useForm } from 'react-hook-form';
import { SopsConfig } from '../../utils/types';
import { PublicKeyList } from './PublicKeyList';
import { useRiScs } from '../../contexts/RiScContext';
import { SopsConfigRequestBody } from '../../utils/DTOs';
import Box from '@mui/material/Box';
import { GitBranchMenu } from './GitBranchMenu';
import { PullRequestComponent } from './PullRequestComponent';
import { OpenPullRequestButton } from './OpenPullRequestButton';
import { DialogContentText } from '@material-ui/core';
import { GcpCryptoKeyMenu } from './GcpCryptoKeyMenu';

interface SopsConfigDialogProps {
  onClose: () => void;
  showDialog: boolean;
  sopsConfigs: SopsConfig[];
  gcpCryptoKeys: GcpCryptoKeyObject[];
  hasOpenedGitBranchMenuOnce: boolean;
  handleOpenGitBranchMenuFirst: () => void;
}

export interface SopsConfigDialogFormData {
  gcpCryptoKey: GcpCryptoKeyObject;
  publicAgeKeysToAdd: string[];
  publicAgeKeysToDelete: string[];
}

export const SopsConfigDialog = ({
  onClose,
  showDialog,
  sopsConfigs,
  gcpCryptoKeys,
  hasOpenedGitBranchMenuOnce,
  handleOpenGitBranchMenuFirst,
}: SopsConfigDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { createSopsConfig, updateSopsConfig, openPullRequestForSopsConfig } =
    useRiScs();

  const [chosenSopsConfig, setChosenSopsConfig] = useState<SopsConfig>(
    sopsConfigs.find(value => value.onDefaultBranch) || sopsConfigs[0]
      ? sopsConfigs[0]
      : {
          gcpCryptoKey: gcpCryptoKeys[0],
          publicAgeKeys: [],
          onDefaultBranch: false,
          pullRequest: null,
          branch: '',
        },
  );

  const handleChangeSopsBranch = (branch: string) => {
    if (branch === chosenSopsConfig.branch) {
      return;
    }
    setChosenSopsConfig(
      sopsConfigs.find(value => value.branch == branch) || sopsConfigs[0],
    );
  };
  
  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] = useState<GcpCryptoKeyObject>(chosenSopsConfig.gcpCryptoKey)
  const handleChangeGcpCryptoKey = (gcpCryptoKey: GcpCryptoKeyObject) => setChosenGcpCryptoKey(gcpCryptoKey)
  const [publicKeysToAdd, setPublicKeysToAdd] = useState<string[]>([]);
  const publicKeysToAddRef = useRef(publicKeysToAdd);
  const [publicKeysToBeDeleted, setPublicKeysToBeDeleted] = useState<string[]>(
    [],
  );
  const publicKeysToBeDeletedRef = useRef(publicKeysToBeDeleted);

  const [publicKeyTextFieldHelperText, setPublicKeyTextFieldHelperText] =
    useState('');

  const [currentPublicKey, setCurrentPublicKey] = useState('');
  const [publicKeyTextFieldError, setPublicKeyTextFieldError] = useState(false);

    const {
        handleSubmit,
        setValue,
        watch,
    } = useForm<SopsConfigDialogFormData>({
        defaultValues: {
            gcpCryptoKey: chosenGcpCryptoKey,
            publicAgeKeysToAdd: publicKeysToAdd,
            publicAgeKeysToDelete: publicKeysToBeDeleted,
        },
    });
  
  useEffect(() => {
    publicKeysToAddRef.current = [];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setValue('gcpCryptoKey', chosenSopsConfig.gcpCryptoKey);
  }, [showDialog, chosenSopsConfig, setValue]);

  const handleClickAddKeyButton = () => {
    if (chosenSopsConfig.publicAgeKeys.includes(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExistInSopsConfig'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    if (publicKeysToAdd.includes(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExists'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    if (!isPublicAgeKeyValid(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyNotValid'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    publicKeysToAddRef.current = [...publicKeysToAdd, currentPublicKey];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setCurrentPublicKey('');
  };

  const handleDeletePublicKeyListItem = (key: string) => {
    publicKeysToAddRef.current = publicKeysToAdd.filter(
      element => element !== key,
    );
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
  };

  const handleDeletePublicKeyAlreadyPresent = (key: string) => {
    if (publicKeysToBeDeleted.includes(key)) {
      publicKeysToBeDeletedRef.current = publicKeysToBeDeleted.filter(
        k => k !== key,
      );
      setPublicKeysToBeDeleted(publicKeysToBeDeletedRef.current);
      setValue('publicAgeKeysToDelete', publicKeysToBeDeletedRef.current);
    } else {
      publicKeysToBeDeletedRef.current = [...publicKeysToBeDeleted, key];
      setPublicKeysToBeDeleted(publicKeysToBeDeletedRef.current);
      setValue('publicAgeKeysToDelete', publicKeysToBeDeletedRef.current);
    }
  };

  const handleClickOpenPullRequestButton = () => {
    openPullRequestForSopsConfig(chosenSopsConfig.branch);
    onClose();
  };
  
  // Check if the SopsConfig we retrieved is exactly the same as the sops config to be written
  const [isDirty, setIsDirty] = useState(true);
  const sopsConfigDialogFormData = watch();
  useEffect(() => {
    setIsDirty(
        //TODO: Finn ut av en fornuftig ting å vise i crypto key meny når det ikke eksisterer en SOPS config
        chosenSopsConfig.gcpCryptoKey.projectId === chosenGcpCryptoKey.projectId
        && chosenSopsConfig.gcpCryptoKey.keyRing === chosenGcpCryptoKey.keyRing
        && chosenSopsConfig.gcpCryptoKey.name === chosenGcpCryptoKey.name
        && sopsConfigDialogFormData.publicAgeKeysToAdd.length === 0
        && sopsConfigDialogFormData.publicAgeKeysToDelete.length === 0
    );
  }, [chosenGcpCryptoKey, chosenSopsConfig, sopsConfigDialogFormData]);

  const onSubmit = handleSubmit((_formData: SopsConfigDialogFormData) => {
    const publicKeysToBeWritten = [
      ...publicKeysToAdd,
      ...chosenSopsConfig.publicAgeKeys.filter(
        key => !publicKeysToBeDeleted.includes(key),
      ),
    ];

    const sopsConfigRequestBody: SopsConfigRequestBody = {
      gcpCryptoKey: chosenGcpCryptoKey,
      publicAgeKeys: publicKeysToBeWritten,
    };

    if (chosenSopsConfig.onDefaultBranch || chosenSopsConfig.branch === '') {
      createSopsConfig(sopsConfigRequestBody);
    } else {
      updateSopsConfig(sopsConfigRequestBody, chosenSopsConfig.branch);
    }
    onClose();
  });

  return (
    <Dialog open={showDialog} onClose={onClose} maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <DialogTitle>{t('sopsConfigDialog.title')}</DialogTitle>
        <Box
          sx={{
            marginRight: 3,
            marginTop: 3,
            gap: 2,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {!chosenSopsConfig.pullRequest &&
            !chosenSopsConfig.onDefaultBranch &&
            chosenSopsConfig.branch !== '' && (
              <OpenPullRequestButton
                handleClick={handleClickOpenPullRequestButton}
              />
            )}
          {chosenSopsConfig.pullRequest && (
            <PullRequestComponent pullRequest={chosenSopsConfig.pullRequest} />
          )}
          {sopsConfigs.length > 0 && (
            <GitBranchMenu
              chosenBranch={chosenSopsConfig.branch}
              onChange={handleChangeSopsBranch}
              sopsConfigs={sopsConfigs}
              hasOpenedOnce={hasOpenedGitBranchMenuOnce}
              handleOpenFirst={handleOpenGitBranchMenuFirst}
            />
          )}
        </Box>
      </Box>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {(sopsConfigs.length === 0 ||
          sopsConfigs.filter(config => config.onDefaultBranch).length < 1) && (
          <DialogContentText>
            {t('sopsConfigDialog.description')}
          </DialogContentText>
        )}
        <FormLabel>{t('sopsConfigDialog.gcpProjectDescription')}</FormLabel>
          
        <GcpCryptoKeyMenu chosenGcpCryptoKey={chosenGcpCryptoKey} onChange={handleChangeGcpCryptoKey} gcpCryptoKeys={gcpCryptoKeys}/>

        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />

        {chosenSopsConfig.publicAgeKeys.length !== 0 && (
          <FormLabel>
            {t('sopsConfigDialog.publicAgeKeysAlreadyPresent')}
          </FormLabel>
        )}
        <PublicKeyList
          publicKeys={chosenSopsConfig.publicAgeKeys}
          onClickButton={handleDeletePublicKeyAlreadyPresent}
          deletedKeys={publicKeysToBeDeleted}
        />

        <FormLabel>{`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
          'dictionary.optional',
        )})`}</FormLabel>
        <PublicKeyList
          publicKeys={publicKeysToAdd}
          onClickButton={handleDeletePublicKeyListItem}
          deletedKeys={publicKeysToBeDeleted}
        />
        <TextField
          label={t('sopsConfigDialog.publicAgeKey')}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleClickAddKeyButton();
            }
          }}
          sx={{ minWidth: 800 }}
          error={publicKeyTextFieldError}
          onFocus={() => {
            setPublicKeyTextFieldError(false);
            setPublicKeyTextFieldHelperText('');
          }}
          value={currentPublicKey}
          helperText={publicKeyTextFieldHelperText}
          onChange={e => setCurrentPublicKey(e.target.value)}
        />
        <Button
          startIcon={<AddCircle />}
          variant="text"
          color="primary"
          onClick={handleClickAddKeyButton}
          sx={{
            maxWidth: 200,
          }}
        >
          {t('sopsConfigDialog.addPublicAgeKey')}
        </Button>
      </DialogContent>

      <DialogActions sx={dialogActions}>
        <Button variant="contained" onClick={onSubmit} disabled={isDirty}>
          {t('sopsConfigDialog.update')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
