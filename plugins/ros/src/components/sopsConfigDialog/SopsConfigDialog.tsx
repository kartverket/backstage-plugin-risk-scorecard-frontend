import Dialog from '@mui/material/Dialog';
import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import DialogContent from '@mui/material/DialogContent';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { Step, StepContent, StepLabel, Stepper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { SopsConfig, SopsConfigDialogFormData } from '../../utils/types';
import { useRiScs } from '../../contexts/RiScContext';
import { GcpCryptoKeyObject, SopsConfigRequestBody } from '../../utils/DTOs';
import Box from '@mui/material/Box';
import { GitBranchMenu } from './GitBranchMenu';
import { PullRequestComponent } from './PullRequestComponent';
import { OpenPullRequestButton } from './OpenPullRequestButton';
import { DialogContentText } from '@material-ui/core';
import { AgeKeysComponent } from './AgeKeysComponent';
import { GcpCryptoKeyMenu } from './GcpCryptoKeyMenu';

interface SopsConfigDialogProps {
  onClose: () => void;
  showDialog: boolean;
  sopsConfigs: SopsConfig[];
  gcpCryptoKeys: GcpCryptoKeyObject[];
  hasOpenedGitBranchMenuOnce: boolean;
  handleOpenGitBranchMenuFirst: () => void;
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
      sopsConfigs.find(value => value.branch === branch) || sopsConfigs[0],
    );
  };
  
  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] = useState<GcpCryptoKeyObject>(chosenSopsConfig.gcpCryptoKey)
  const handleChangeGcpCryptoKey = (gcpCryptoKey: GcpCryptoKeyObject) => setChosenGcpCryptoKey(gcpCryptoKey)
  const [publicKeysToAdd, setPublicKeysToAdd] = useState<string[]>([]);
  const publicKeysToAddRef = useRef(publicKeysToAdd);
  const [publicKeysToBeDeleted, setPublicKeysToBeDeleted] = useState<string[]>(
    [],
  );

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

  const handleClickOpenPullRequestButton = () => {
    openPullRequestForSopsConfig(chosenSopsConfig.branch);
    onClose();
  };

  // Check if the SopsConfig we retrieved is exactly the same as the sops config to be written
  const [isDirty, setIsDirty] = useState(true);
  const sopsConfigDialogFormData = watch();
  useEffect(() => {
    setIsDirty(
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
            <StepLabel
              onClick={() => setActiveStep(0)}
              sx={{ cursor: 'pointer' }}
            >
              {t('sopsConfigDialog.gcpProjectTitle')}
            </StepLabel>
            <StepContent>
              {t('sopsConfigDialog.gcpProjectDescription')}

              <GcpCryptoKeyMenu chosenGcpCryptoKey={chosenGcpCryptoKey} onChange={handleChangeGcpCryptoKey} gcpCryptoKeys={gcpCryptoKeys}/>

              <AgeKeysComponent
                chosenSopsConfig={chosenSopsConfig}
                publicKeysToAdd={publicKeysToAdd}
                setPublicKeysToAdd={setPublicKeysToAdd}
                publicKeysToBeDeleted={publicKeysToBeDeleted}
                setPublicKeysToBeDeleted={setPublicKeysToBeDeleted}
                setValue={setValue}
              />

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
            <StepLabel
              onClick={
                chosenSopsConfig.branch !== ''
                    ? () => setActiveStep(1)
                    : undefined
              }
              sx={{ cursor: 'pointer' }}
            >{t('sopsConfigDialog.createPRTitle')}</StepLabel>
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
            <StepLabel
              onClick={
                chosenSopsConfig.pullRequest
                  ? () => setActiveStep(2)
                  : undefined
              }
              sx={{ cursor: 'pointer' }}
            >
              {t('sopsConfigDialog.PRTitle')}
            </StepLabel>
            <StepContent>
              {t('sopsConfigDialog.SummaryGCP')}
              <strong>
                TODO!!!!
              </strong>
              {'. '}
              {chosenSopsConfig.publicAgeKeys.length !== 0 && (
                <>
                  {t('sopsConfigDialog.SummaryAgeKeys')}
                  {chosenSopsConfig.publicAgeKeys.map(key => key).join(',')}
                </>
              )}
              <p>{t('sopsConfigDialog.PRContent')}</p>
              {chosenSopsConfig.pullRequest && (
                <Box m={1} display="flex" alignItems="center">
                  <Box flex={1}>
                    <PullRequestComponent
                      pullRequest={chosenSopsConfig.pullRequest}
                    />
                  </Box>
                  <Box flex={1}>
                    <GitBranchMenu
                      chosenBranch={chosenSopsConfig.branch}
                      onChange={handleChangeSopsBranch}
                      sopsConfigs={sopsConfigs}
                      hasOpenedOnce={hasOpenedGitBranchMenuOnce}
                      handleOpenFirst={handleOpenGitBranchMenuFirst}
                    />
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={dialogActions}>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
