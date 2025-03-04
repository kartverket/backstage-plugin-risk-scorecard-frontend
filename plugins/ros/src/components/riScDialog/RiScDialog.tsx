import React, { useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { emptyRiSc } from '../../utils/utilityfunctions';
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

const RiScStepper = ({children, activeStep}: {children: React.ReactNode, activeStep: number}  ) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const steps = [
    t('rosDialog.stepRiscDetails'),
    t('rosDialog.stepEncryption'),
  ];
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stepper activeStep={activeStep}>
            {steps.map((label) => (
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
      dialogState === RiScDialogStates.EditRiscInfo || dialogState === RiScDialogStates.EditEncryption
        ? selectedRiSc!
        : {
            content: emptyRiSc(),
              sopsConfig: {
                shamir_threshold: 2,
                key_groups: [],
              },
          },
    mode: 'onBlur',
  });

  const [activeStep, setActiveStep] = useState(0);
  const titleTranslation = (() => {
    if (dialogState === RiScDialogStates.Create) {
      return t('rosDialog.titleNew', {});
    }
    if (dialogState === RiScDialogStates.EditRiscInfo) {
      return t('rosDialog.titleEdit', {});
    }
    return t('rosDialog.editEncryption', {});
  })();

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

  const handleNext = handleSubmit(() => {
    if (activeStep === 0) {
      setActiveStep(1);
    }
  });

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  const handleFinish = handleSubmit((data: RiScWithMetadata) => {
    if (dialogState === RiScDialogStates.Create) {
      // eslint-disable-next-line no-console
      console.log('Create RiSc', data);
      createNewRiSc(data, createRiScFrom === CreateRiScFrom.Default);
    } else {
      // eslint-disable-next-line no-console
      console.log('Update RiSc', data);
      updateRiSc(data);
    }
    onClose();
  });

  if (dialogState === RiScDialogStates.Create) {
    return (
      <Dialog open={dialogState === RiScDialogStates.Create} onClose={onClose}>
        <DialogTitle>{titleTranslation}</DialogTitle>
      <RiScStepper activeStep={activeStep}>
      <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {activeStep === 0 && (
            <ConfigRiscInfo dialogState={dialogState} createRiScFrom={createRiScFrom} handleChangeCreateRiScFrom={handleChangeCreateRiScFrom} register={register} errors={errors} />
          )}
          {activeStep === 1 && (
            <ConfigEncryptionDialog gcpCryptoKeys={gcpCryptoKeys} setValue={setValue} state={dialogState} register={register} />
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
          {activeStep === 0 ? (
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
    )
  }

  if (dialogState === RiScDialogStates.EditRiscInfo) {
    return (
      <Dialog open={dialogState === RiScDialogStates.EditRiscInfo} onClose={onClose}>
      <DialogTitle>{titleTranslation}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
      <ConfigRiscInfo dialogState={dialogState} createRiScFrom={createRiScFrom} handleChangeCreateRiScFrom={handleChangeCreateRiScFrom} register={register} errors={errors} />
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
    )
  }

  if (dialogState === RiScDialogStates.EditEncryption) {
    return (
      <Dialog open={dialogState === RiScDialogStates.EditEncryption} onClose={onClose}>
        <DialogTitle>{titleTranslation}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
      <ConfigEncryptionDialog gcpCryptoKeys={gcpCryptoKeys} sopsData={selectedRiSc?.sopsConfig} setValue={setValue} state={dialogState} register={register}/>
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
    )
  }

return null;
};