import Dialog from '@mui/material/Dialog';
import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import {
  gcpProjectIdToReadableString,
  isPublicAgeKeyValid,
} from '../../utils/utilityfunctions';
import DialogContent from '@mui/material/DialogContent';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import AddCircle from '@mui/icons-material/AddCircle';
import { Controller, useForm } from 'react-hook-form';
import { SopsConfig } from '../../utils/types';
import { PublicKeyList } from './PublicKeyList';
import { useRiScs } from '../../contexts/RiScContext';
import { SopsConfigRequestBody } from '../../utils/DTOs';
import Box from '@mui/material/Box';
import { GitBranchMenu } from './GitBranchMenu';
import { PullRequestComponent } from './PullRequestComponent';
import { OpenPullRequestButton } from './OpenPullRequestButton';
import { DialogContentText } from '@material-ui/core';

interface SopsConfigDialogProps {
  onClose: () => void;
  showDialog: boolean;
  sopsConfigs: SopsConfig[];
  gcpProjectIds: string[];
  hasOpenedGitBranchMenuOnce: boolean;
  handleOpenGitBranchMenuFirst: () => void;
}

export interface SopsConfigDialogFormData {
  gcpProjectId: string;
  publicAgeKeysToAdd: string[];
  publicAgeKeysToDelete: string[];
}

export const SopsConfigDialog = ({
  onClose,
  showDialog,
  sopsConfigs,
  gcpProjectIds,
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
          gcpProjectId: '',
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
      sopsConfigs.find(value => value.branch === branch) || sopsConfigs[0],
    );
  };

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
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SopsConfigDialogFormData>({
    defaultValues: {
      gcpProjectId: chosenSopsConfig.gcpProjectId,
      publicAgeKeysToAdd: publicKeysToAdd,
      publicAgeKeysToDelete: publicKeysToBeDeleted,
    },
  });

  useEffect(() => {
    publicKeysToAddRef.current = [];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setValue('gcpProjectId', chosenSopsConfig.gcpProjectId);
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
      sopsConfigDialogFormData.gcpProjectId === '' ||
        (chosenSopsConfig.gcpProjectId ===
          sopsConfigDialogFormData.gcpProjectId &&
          sopsConfigDialogFormData.publicAgeKeysToAdd.length === 0 &&
          sopsConfigDialogFormData.publicAgeKeysToDelete.length === 0),
    );
  }, [sopsConfigDialogFormData, chosenSopsConfig]);

  const onSubmit = handleSubmit((formData: SopsConfigDialogFormData) => {
    const publicKeysToBeWritten = [
      ...publicKeysToAdd,
      ...chosenSopsConfig.publicAgeKeys.filter(
        key => !publicKeysToBeDeleted.includes(key),
      ),
    ];

    const sopsConfigRequestBody: SopsConfigRequestBody = {
      gcpProjectId: formData.gcpProjectId,
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

        <Controller
          name="gcpProjectId"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={gcpProjectIds}
              getOptionLabel={(option: string) =>
                gcpProjectIdToReadableString(option)
              }
              value={sopsConfigDialogFormData.gcpProjectId}
              disableClearable={true}
              sx={{ width: 300 }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('sopsConfigDialog.gcpProject')}
                  error={!!errors.gcpProjectId}
                />
              )}
              onChange={(_, value) => field.onChange(value)}
            />
          )}
        />

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
