import React, { useState } from 'react';
import { DefaultRiScType, RiScWithMetadata } from '../../utils/types';
import { emptyRiSc, isDeeplyEqual } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';
import { useForm } from 'react-hook-form';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import { Step, StepLabel, Stepper } from '@mui/material';
import ConfigEncryptionDialog from './ConfigEncryptionDialog';
import ConfigRiscInfo from './ConfigRiscInfo';
import ConfigInitialRisc from './ConfigInitialRisc';
import { Flex, Box, Button } from '@backstage/ui';

export enum RiScDialogStates {
  Closed = 0,
  Create = 1,
  EditRiscInfo = 2,
  SelectInitialRisc = 3,
  EditEncryption = 4,
  Delete = 5,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
  onDelete: () => void;
}

function RiScStepper({
  children,
  activeStep,
}: {
  children: React.ReactNode;
  activeStep: number;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const steps = [
    t('rosDialog.initialRiscTitle'),
    t('rosDialog.stepRiscDetails'),
    t('rosDialog.stepEncryption'),
  ];
  return (
    <Box style={{ width: '100%', padding: '24px' }}>
      <Stepper activeStep={activeStep}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {children}
    </Box>
  );
}

export function RiScDialog({
  onClose,
  dialogState,
  onDelete,
}: RiScDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { selectedRiSc, createNewRiSc, deleteRiSc, updateRiSc, gcpCryptoKeys } =
    useRiScs();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RiScWithMetadata>({
    defaultValues:
      dialogState === RiScDialogStates.EditRiscInfo ||
      dialogState === RiScDialogStates.EditEncryption
        ? selectedRiSc!
        : {
            content: emptyRiSc(),
            sopsConfig: {
              shamir_threshold: 2,
            },
          },
    mode: 'onBlur',
  });

  const [activeStep, setActiveStep] = useState(0);

  const [switchOn, setSwitchOn] = useState(false);

  const [selectedRiScType, setSelectedRiScType] = useState<DefaultRiScType>(
    DefaultRiScType.Standard,
  );

  const handleNext = handleSubmit(
    () => {
      if (activeStep === 0) {
        setActiveStep(1);
      }
      if (activeStep === 1) {
        setActiveStep(2);
      }
    },
    // Continue to step 1 even if there are errors, as long as there are no errors in step 0 (the content)
    validationErrors => {
      if (activeStep === 0 && validationErrors.content === undefined) {
        setActiveStep(1);
      }
    },
  );

  function handleBack() {
    if (activeStep === 1) {
      setActiveStep(0);
    }
    if (activeStep === 2) {
      setActiveStep(1);
    }
  }

  const handleFinish = handleSubmit((data: RiScWithMetadata) => {
    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(data, switchOn, [selectedRiScType]);
    } else if (dialogState === RiScDialogStates.Delete) {
      deleteRiSc();
    } else {
      // Do manual comparison of contents, as the sopsConfig field contains many values from the backend that are not
      // used or set by the frontend.
      // Check if the additional Age keys are equal, using the single important field, `recipient`
      const areAgeKeysEqual = isDeeplyEqual(
        data.sopsConfig.age?.map(age => age.recipient).sort(),
        selectedRiSc?.sopsConfig.age?.map(age => age.recipient).sort(),
      );

      // Check if the GCP keys are equal, using the two important fields, `resource_id` and `created_at`.
      // Comparison uses dictionaries, where resource ids are keys and created at dates are values
      const areGCPKeysEqual = isDeeplyEqual(
        Object.fromEntries(
          data.sopsConfig.gcp_kms?.map(key => [
            key.resource_id,
            key.created_at,
          ]) ?? [],
        ),
        Object.fromEntries(
          selectedRiSc?.sopsConfig.gcp_kms?.map(key => [
            key.resource_id,
            key.created_at,
          ]) ?? [],
        ),
      );

      // Only update the risc if it has changed
      if (
        !isDeeplyEqual(data, selectedRiSc, ['sopsConfig']) ||
        !areGCPKeysEqual ||
        !areAgeKeysEqual
      ) {
        updateRiSc(data);
      }
    }
    onClose();
  });

  if (dialogState === RiScDialogStates.Create) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>{t('rosDialog.titleNew')}</DialogTitle>
        <RiScStepper activeStep={activeStep}>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              paddingX: 1,
              paddingY: 0.5,
            }}
          >
            {activeStep === 0 && (
              <ConfigInitialRisc
                dialogState={dialogState}
                switchOn={switchOn}
                setSwitchOn={setSwitchOn}
                setValue={setValue}
                selectedRiScType={selectedRiScType}
                setSelectedRiScType={setSelectedRiScType}
              />
            )}
            {activeStep === 1 && (
              <ConfigRiscInfo
                dialogState={dialogState}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                selectedRiScType={selectedRiScType}
              />
            )}
            {activeStep === 2 && (
              <ConfigEncryptionDialog
                gcpCryptoKeys={gcpCryptoKeys}
                setValue={setValue}
                state={dialogState}
                register={register}
                errors={errors}
              />
            )}
          </DialogContent>
        </RiScStepper>
        <DialogActions sx={dialogActions}>
          <Button size="medium" variant="secondary" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          <Flex>
            <Button
              size="medium"
              variant="secondary"
              isDisabled={activeStep === 0}
              onClick={handleBack}
            >
              {t('dictionary.previous')}
            </Button>
            {activeStep < 2 ? (
              <Button size="medium" variant="primary" onClick={handleNext}>
                {t('dictionary.next')}
              </Button>
            ) : (
              <Button size="medium" variant="primary" onClick={handleFinish}>
                {t('dictionary.save')}
              </Button>
            )}
          </Flex>
        </DialogActions>
      </Dialog>
    );
  }

  if (dialogState === RiScDialogStates.Delete) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContent>{t('deleteDialog.confirmationMessage')}</DialogContent>
        </DialogContent>
        <DialogActions>
          <Button size="medium" variant="secondary" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          <Button size="medium" variant="primary" onClick={handleFinish}>
            {t('dictionary.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (dialogState === RiScDialogStates.EditRiscInfo) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>
          <Flex direction="column">{t('rosDialog.titleEdit')}</Flex>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            paddingX: 4,
            paddingY: 3,
          }}
        >
          <ConfigRiscInfo
            dialogState={dialogState}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            selectedRiScType={selectedRiScType}
          />
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button
            size="medium"
            variant="tertiary"
            onClick={onDelete}
            style={{ color: '#d32f2f', paddingLeft: 0 }}
          >
            <i className="ri-delete-bin-line" style={{ fontSize: '16px' }} />
            {t('contentHeader.deleteButton')}
          </Button>
          <Flex>
            <Button size="medium" variant="secondary" onClick={onClose}>
              {t('dictionary.cancel')}
            </Button>
            <Button size="medium" variant="primary" onClick={handleFinish}>
              {t('dictionary.save')}
            </Button>
          </Flex>
        </DialogActions>
      </Dialog>
    );
  }

  if (dialogState === RiScDialogStates.EditEncryption) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>{t('rosDialog.editEncryption')}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <ConfigEncryptionDialog
            gcpCryptoKeys={gcpCryptoKeys}
            sopsData={selectedRiSc?.sopsConfig}
            setValue={setValue}
            state={dialogState}
            register={register}
            errors={errors}
          />
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button size="medium" variant="secondary" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          <Button size="medium" variant="primary" onClick={handleFinish}>
            {t('dictionary.save')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
}
