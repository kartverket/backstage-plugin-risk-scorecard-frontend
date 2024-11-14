import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import { gcpProjectIdsToReadableString } from '../../utils/utilityfunctions';
import { useAuthenticatedFetch } from '../../utils/hooks';
import DialogContent from '@mui/material/DialogContent';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import { PublicKeyTextField } from '../common/PublicKeyTextField';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { SopsConfig } from '../../utils/types';

export enum SopsConfigDialogStates {
  Closed,
  Edit,
  Create,
}

interface SopsConfigDialogProps {
  onClose: () => void;
  dialogState: SopsConfigDialogStates;
}

export const SopsConfigDialog = ({
  onClose,
  dialogState,
}: SopsConfigDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const titleTranslation =
    dialogState === SopsConfigDialogStates.Create
      ? t('sopsConfigDialog.titleNew')
      : t('sopsConfigDialog.titleEdit');

  const { fetchGcpProjects } = useAuthenticatedFetch();

  const [associatedGcpProjects, setAssociatedGcpProjects] = useState<string[]>(
    [],
  );
  const [chosenGcpProject, setChosenGcpProject] = useState<string>('');

  const handleChangeGcpProject = (item: string) => {
    setChosenGcpProject(item);
  };

  const [numberOfPublicKeyTextFields, setNumberOfPublicKeyTextFields] =
    useState(0);

  const handleClickAddKeyButton = () =>
    setNumberOfPublicKeyTextFields(prevState => prevState + 1);
  const handleClickDeletePublicKeyTextField = () =>
    setNumberOfPublicKeyTextFields(prevState => prevState - 1);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<SopsConfig>({
    defaultValues: {
      gcpProjectId: '',
      publicAgeKeys: Array(numberOfPublicKeyTextFields).fill(''),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'publicAgeKeys',
  });

  const onSubmit = handleSubmit((data: SopsConfig) => {
    onClose();
  });

  useEffect(() => {
    // Reset form with a new array in b when numFields changes
    reset({
      gcpProjectId: '',
      publicAgeKeys: Array(numberOfPublicKeyTextFields).fill(''),
    });
  }, [numberOfPublicKeyTextFields, reset]);

  useEffect(() => {
    fetchGcpProjects()
      .then(res => {
        setAssociatedGcpProjects(res);
        setChosenGcpProject(res[0]);
      })
      .catch(err => {
        throw err;
      });
  }, []);

  return (
    <Dialog
      open={dialogState !== SopsConfigDialogStates.Closed}
      onClose={onClose}
    >
      <DialogTitle>{titleTranslation}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <FormLabel>{t('sopsConfigDialog.description')}</FormLabel>
        <Controller
          name="gcpProjectId"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              disablePortal
              options={gcpProjectIdsToReadableString(associatedGcpProjects)}
              sx={{ width: 300 }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('sopsConfigDialog.gcpProject')}
                />
              )}
            />
          )}
        />

        <FormLabel>{t('sopsConfigDialog.publicAgeKeyDescription')}</FormLabel>
        {fields.map((field, index) => (
          <Controller
            key={field.id}
            name={`publicAgeKeys.${index}`}
            control={control}
            render={({ field }) => (
              <PublicKeyTextField
                {...field}
                onClick={handleClickDeletePublicKeyTextField}
                minWidth={500}
              />
            )}
          />
        ))}
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
        <Button variant="contained" onClick={onSubmit} disabled={!isDirty}>
          {t('sopsConfigDialog.update')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
