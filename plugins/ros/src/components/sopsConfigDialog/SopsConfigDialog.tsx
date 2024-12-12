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
import { PullRequestComponent } from './PullRequestComponent';
import { OpenPullRequestButton } from './OpenPullRequestButton';
import { DialogContentText } from '@material-ui/core';
import { AgeKeysComponent } from './AgeKeysComponent';
import { GcpCryptoKeyMenu } from './GcpCryptoKeyMenu';
import Typography from '@mui/material/Typography';

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
}: SopsConfigDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { createSopsConfig, updateSopsConfig, openPullRequestForSopsConfig } =
    useRiScs();

  const [chosenSopsConfig, _setChosenSopsConfig] = useState<SopsConfig>(
    sopsConfigs.find(value => value.onDefaultBranch) || sopsConfigs[0]
      ? sopsConfigs[0]
      : {
          gcpCryptoKey: {
            projectId: '',
            keyRing: '',
            name: '',
            hasEncryptDecryptAccess: false,
          },
          publicAgeKeys: [],
          onDefaultBranch: false,
          pullRequest: null,
          branch: '',
        },
  );

  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] =
    useState<GcpCryptoKeyObject>(chosenSopsConfig.gcpCryptoKey);
  const handleChangeGcpCryptoKey = (gcpCryptoKey: GcpCryptoKeyObject) =>
    setChosenGcpCryptoKey(gcpCryptoKey);
  const [publicKeysToAdd, setPublicKeysToAdd] = useState<string[]>([]);
  const publicKeysToAddRef = useRef(publicKeysToAdd);
  const [publicKeysToBeDeleted, setPublicKeysToBeDeleted] = useState<string[]>(
    [],
  );

  const { handleSubmit, setValue, watch } = useForm<SopsConfigDialogFormData>({
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
      chosenSopsConfig.gcpCryptoKey.projectId ===
        chosenGcpCryptoKey.projectId &&
        chosenSopsConfig.gcpCryptoKey.keyRing === chosenGcpCryptoKey.keyRing &&
        chosenSopsConfig.gcpCryptoKey.name === chosenGcpCryptoKey.name &&
        sopsConfigDialogFormData.publicAgeKeysToAdd.length === 0 &&
        sopsConfigDialogFormData.publicAgeKeysToDelete.length === 0,
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
              {t('sopsConfigDialog.selectKeysTitle')}
            </StepLabel>
            <StepContent>
              {t('sopsConfigDialog.gcpCryptoKeyDescription')}

              <GcpCryptoKeyMenu
                chosenGcpCryptoKey={chosenGcpCryptoKey}
                onChange={handleChangeGcpCryptoKey}
                gcpCryptoKeys={gcpCryptoKeys}
              />

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
                !chosenSopsConfig.pullRequest &&
                !chosenSopsConfig.onDefaultBranch &&
                chosenSopsConfig.branch !== ''
                  ? () => setActiveStep(1)
                  : undefined
              }
              sx={{
                cursor:
                  !chosenSopsConfig.pullRequest &&
                  !chosenSopsConfig.onDefaultBranch &&
                  chosenSopsConfig.branch !== ''
                    ? 'pointer'
                    : 'default',
              }}
            >
              {t('sopsConfigDialog.createPRTitle')}
            </StepLabel>
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
              </Box>
            </StepContent>
          </Step>

          <Step key="step3">
            <StepLabel
              optional={
                <Typography variant="caption">
                  {t('dictionary.summary')}
                </Typography>
              }
              onClick={
                chosenSopsConfig.pullRequest
                  ? () => setActiveStep(2)
                  : undefined
              }
              sx={{
                cursor: chosenSopsConfig.pullRequest ? 'pointer' : 'default',
              }}
            >
              {t('sopsConfigDialog.PRTitle')}
            </StepLabel>
            <StepContent>
              {t('sopsConfigDialog.SummaryDescription')}
              <br />
              <br />
              {t('sopsConfigDialog.SummaryGCP')}
              <strong>{chosenGcpCryptoKey.name}</strong>
              {'. '}
              <br />
              <br />
              {chosenSopsConfig.publicAgeKeys.length !== 0 && (
                <>
                  {t('sopsConfigDialog.SummaryAgeKeys')}
                  <strong>
                    {chosenSopsConfig.publicAgeKeys
                      .map(key => `${key.substring(0, 8)}...${key.slice(-4)}`)
                      .join(',')}
                  </strong>
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
