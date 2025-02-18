import React, { useEffect, useRef, useState } from 'react';
import { RiSc, RiScWithMetadata, SopsConfig } from '../../utils/types';
import { emptyRiSc, isPublicAgeKeyValid } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import { DialogContentText, IconButton, List, ListItem, ListItemText, TextField, ListItemSecondaryAction } from '@material-ui/core';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Step, StepLabel, Stepper } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary, FormLabel } from '@mui/material';
import { GcpCryptoKeyMenu } from '../sopsConfigDialog/GcpCryptoKeyMenu';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import { AddCircle} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export enum RiScDialogStates {
  Closed,
  Edit,
  Create,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
}

enum CreateRiScFrom {
  Scratch,
  Default,
}

export const RiScDialog = ({ onClose, dialogState }: RiScDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc, createNewRiSc, updateRiSc, gcpCryptoKeys } = useRiScs();

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
    setValue,
  } = useForm<RiScWithMetadata>({
    defaultValues:
      dialogState === RiScDialogStates.Edit
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
  const [riscData, setRiscData] = useState<RiSc | null>(null);
  const [sopsData, setSopsData] = useState<SopsConfig | null>(null);
  const [publicAgeKeyHelperText, setPublicKeyTextFieldHelperText] = useState("");
  const [publicAgeKeyError, setPublicKeyTextFieldError] = useState(false);
  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] =
    useState<GcpCryptoKeyObject>(gcpCryptoKeys[0]);
  const [publicAgeKeys, setPublicAgeKeys] = useState<string[]>([]);
  const [newPublicAgeKey, setNewPublicAgeKey] = useState("");
  const handleChangeGcpCryptoKey = (gcpCryptoKey: GcpCryptoKeyObject) =>
    setChosenGcpCryptoKey(gcpCryptoKey);

  useEffect(() => {
    setValue('sopsConfig', {
      shamir_threshold: 2,
      key_groups: [{
        gcp_kms: [{
          resource_id: chosenGcpCryptoKey.resourceId,
          created_at: chosenGcpCryptoKey.createdAt,
        }],
      },
      {
        age: publicAgeKeys.map(key => ({
          recipient: key,
        })),
      },
    ],
    });
  }, [chosenGcpCryptoKey, publicAgeKeys, setValue]);
  

  const steps = [
    t('rosDialog.stepRiscDetails'),
    t('rosDialog.stepEncryption'),
  ];

  const titleTranslation =
    dialogState === RiScDialogStates.Create
      ? t('rosDialog.titleNew')
      : t('rosDialog.titleEdit');

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

  const handleNext = handleSubmit((data: RiScWithMetadata) => {
    if (activeStep === 0) {
      setRiscData(data.content);
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
      console.log('data', data);
      createNewRiSc(data, createRiScFrom === CreateRiScFrom.Default);
    } else {
      updateRiSc(data.content);
    }
    onClose();
  });

  const handleAddPublicAgeKey = () => {
    if (isPublicAgeKeyValid(newPublicAgeKey)) {
      if (publicAgeKeys.includes(newPublicAgeKey)) {
        setPublicKeyTextFieldHelperText(
          t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExistInSopsConfig'),
        );
        setPublicKeyTextFieldError(true);
      } else {
        setPublicAgeKeys([...publicAgeKeys, newPublicAgeKey]);
        setNewPublicAgeKey("");
      }
    } else {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyNotValid'),
      );
      setPublicKeyTextFieldError(true);
    }
  };

  return (
      <Dialog open={dialogState !== RiScDialogStates.Closed} onClose={onClose}>
        <DialogTitle>{titleTranslation}</DialogTitle>

        <Box sx={{ width: '100%', p: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {activeStep === 0 && (
            <>
              <Input
                required
                {...register('content.title', { required: true })}
                error={errors?.content?.title !== undefined}
                label={t('dictionary.title')}
              />
              <Input
                required
                {...register('content.scope', { required: true })}
                label={t('dictionary.scope')}
                sublabel={t('rosDialog.scopeDescription')}
                error={errors?.content?.scope !== undefined}
                minRows={4}
              />

              {dialogState === RiScDialogStates.Create && (
                <div>
                  <DialogContentText>
                    {t('rosDialog.generateInitialDescription')}
                  </DialogContentText>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {t('rosDialog.generateInitialToggleDescription')}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch onChange={() => handleChangeCreateRiScFrom()} />
                      }
                      label={
                        createRiScFrom === CreateRiScFrom.Scratch
                          ? t('dictionary.no')
                          : t('dictionary.yes')
                      }
                    />
                  </Box>
                </div>
              )}
            </>
          )}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DialogContentText>
              {t('sopsConfigDialog.description')}
            </DialogContentText>
                  {t('sopsConfigDialog.selectKeysTitle')}
      
                  {t('sopsConfigDialog.gcpCryptoKeyDescription')}
      
                  <GcpCryptoKeyMenu
                    chosenGcpCryptoKey={chosenGcpCryptoKey}
                    onChange={handleChangeGcpCryptoKey}
                    gcpCryptoKeys={gcpCryptoKeys}
                  />
                  <Box>
      <Accordion
        elevation={1}
        defaultExpanded={sopsData ? true : false}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"  
          id="panel1-header"
        >
          {t('sopsConfigDialog.publicAgeKeyQuestion')}
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {sopsData?.publicAgeKeys && (
              <FormLabel>
                {t('sopsConfigDialog.publicAgeKeysAlreadyPresent')}
              </FormLabel>
            )}
            <List>
              {publicAgeKeys.map((key) => (
                <ListItem dense={true}>
                  <ListItemText>{key}</ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => {
                      setPublicAgeKeys(publicAgeKeys.filter(k => k !== key));
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Typography>
            {`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
              'dictionary.optional',
            )})`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'space-between', gap: 2 }}>
            <TextField
              label={t('sopsConfigDialog.publicAgeKey')}
              helperText={publicAgeKeyHelperText}
              error={publicAgeKeyError}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleAddPublicAgeKey();
                }
              }}
              onFocus={() => {
                setPublicKeyTextFieldError(false);
                setPublicKeyTextFieldHelperText('');
              }}
              value={newPublicAgeKey}
              onChange={(e) => setNewPublicAgeKey(e.target.value)}
            />
            <Button
              startIcon={<AddCircle />}
              variant="text"
              color="primary"
              onClick={handleAddPublicAgeKey}
              sx={{
                maxWidth: 200,
                mt: 1,
              }}
            >
              {t('sopsConfigDialog.addPublicAgeKey')}
            </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
          </Box>
          )}
        </DialogContent>

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
            <Button variant="contained" onClick={handleNext} disabled={!isDirty}>
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
};