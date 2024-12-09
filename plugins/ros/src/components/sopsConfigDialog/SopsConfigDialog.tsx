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
import {
  Autocomplete,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@mui/material';
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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  DialogContentText,
} from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

  useEffect(() => {
    publicKeysToAddRef.current = [];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setValue('gcpProjectId', chosenSopsConfig.gcpProjectId);
  }, [showDialog, chosenSopsConfig]);

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
  }, [sopsConfigDialogFormData]);

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

  const determineActiveStep = (config: SopsConfig): number => {
    if (config.pullRequest) {
      return 2;
    } else if (
      !config.pullRequest &&
      !config.onDefaultBranch &&
      config.branch !== ''
    ) {
      return 1;
    }
    return 0;
  };

  const [activeStep, setActiveStep] = useState(() =>
    determineActiveStep(chosenSopsConfig),
  );

  useEffect(() => {
    setActiveStep(determineActiveStep(chosenSopsConfig));
  }, [chosenSopsConfig]);

  return (
    <Dialog open={showDialog} onClose={onClose} maxWidth="md">
      <DialogTitle>{t('sopsConfigDialog.title')}</DialogTitle>

      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {(sopsConfigs.length === 0 ||
          sopsConfigs.filter(config => config.onDefaultBranch).length < 1) && (
          <DialogContentText>
            {t('sopsConfigDialog.description')}
          </DialogContentText>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          <Step key="step1">
            <StepLabel>{t('sopsConfigDialog.gcpProjectTitle')}</StepLabel>
            <StepContent>
              {t('sopsConfigDialog.gcpProjectDescription')}
              <Accordion elevation={0}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  {t('sopsConfigDialog.gcpKeyRoleQuestion')}
                </AccordionSummary>
                <AccordionDetails>
                  {t('sopsConfigDialog.gcpKeyRoleAnswer')}
                </AccordionDetails>
              </Accordion>
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
                    disableClearable
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
              <Box>
                <Accordion elevation={0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    {t('sopsConfigDialog.publicAgeKeyQuestion')}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
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

                      {`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
                        'dictionary.optional',
                      )})`}

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
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>

              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={isDirty}
                sx={{ mt: 1 }}
              >
                {t('sopsConfigDialog.update')}
              </Button>
            </StepContent>
          </Step>

          <Step key="step2">
            <StepLabel>{t('sopsConfigDialog.createPRTitle')}</StepLabel>
            <StepContent>
              {t('sopsConfigDialog.createPRContent')}
              <Box m={1}>
                {!chosenSopsConfig.pullRequest &&
                  !chosenSopsConfig.onDefaultBranch &&
                  chosenSopsConfig.branch !== '' && (
                    <OpenPullRequestButton
                      handleClick={handleClickOpenPullRequestButton}
                    />
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
            </StepContent>
          </Step>

          <Step key="step3">
            <StepLabel>{t('sopsConfigDialog.PRTitle')}</StepLabel>
            <StepContent>
              {t('sopsConfigDialog.PRContent')}
              {chosenSopsConfig.pullRequest && (
                <PullRequestComponent
                  pullRequest={chosenSopsConfig.pullRequest}
                />
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={dialogActions}>
        {/* <Button
          variant="contained"
          onClick={() => resetEncryption}
          // må evt ha en disabled når ingen endringer er gjort
        >
          {t('sopsConfigDialog.startOver')}
        </Button> */}
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
