import { useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { emptyRiSc, isDeeplyEqual } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import Box from '@mui/material/Box';
import { Step, StepLabel, Stepper } from '@mui/material';
import ConfigEncryptionDialog from './ConfigEncryptionDialog';
import ConfigRiscInfo from './ConfigRiscInfo';

export enum RiScDialogStates {
  Closed,
  Create,
  EditRiscInfo,
  EditEncryption,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
}

export enum CreateRiScFrom {
  Scratch,
  Default,
}

const RiScStepper = ({
  children,
  activeStep,
}: {
  children: React.ReactNode;
  activeStep: number;
}) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const steps = [t('rosDialog.stepRiscDetails'), t('rosDialog.stepEncryption')];
  return (
    <Box sx={{ width: '100%', p: 2 }}>
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
};

export const RiScDialog = ({ onClose, dialogState }: RiScDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc, createNewRiSc, updateRiSc, gcpCryptoKeys } = useRiScs();

  const {
    register,
    handleSubmit,
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

  const [createRiScFrom, setCreateRiScFrom] = useState<CreateRiScFrom>(
    CreateRiScFrom.Scratch,
  );
  const handleChangeCreateRiScFrom = () => {
    if (createRiScFrom === CreateRiScFrom.Scratch) {
      setCreateRiScFrom(CreateRiScFrom.Default);
    } else {
      setCreateRiScFrom(CreateRiScFrom.Scratch);
    }
  };

  const handleNext = handleSubmit(
    () => {
      if (activeStep === 0) {
        setActiveStep(1);
      }
    },
    // Continue to step 1 even if there are errors, as long as there are no errors in step 0 (the content)
    validationErrors => {
      if (activeStep === 0 && validationErrors.content === undefined) {
        setActiveStep(1);
      }
    },
  );

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  const handleFinish = handleSubmit((data: RiScWithMetadata) => {
    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(data, createRiScFrom === CreateRiScFrom.Default);
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
            sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {activeStep === 0 && (
              <ConfigRiscInfo
                dialogState={dialogState}
                createRiScFrom={createRiScFrom}
                handleChangeCreateRiScFrom={handleChangeCreateRiScFrom}
                register={register}
                errors={errors}
              />
            )}
            {activeStep === 1 && (
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
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              {t('dictionary.previous')}
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          {activeStep < 1 ? (
            <Button variant="contained" onClick={handleNext}>
              {t('dictionary.next')}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleFinish}>
              {t('dictionary.save')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  if (dialogState === RiScDialogStates.EditRiscInfo) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogTitle>{t('rosDialog.titleEdit')}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <ConfigRiscInfo
            dialogState={dialogState}
            createRiScFrom={createRiScFrom}
            handleChangeCreateRiScFrom={handleChangeCreateRiScFrom}
            register={register}
            errors={errors}
          />
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button variant="outlined" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          <Button variant="contained" onClick={handleFinish}>
            {t('dictionary.save')}
          </Button>
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
          <Button variant="outlined" onClick={onClose}>
            {t('dictionary.cancel')}
          </Button>
          <Button variant="contained" onClick={handleFinish}>
            {t('dictionary.save')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
};
