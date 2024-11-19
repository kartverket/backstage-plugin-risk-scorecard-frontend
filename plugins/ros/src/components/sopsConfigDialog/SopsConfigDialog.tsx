import Dialog from '@mui/material/Dialog';
import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import { gcpProjectIdToReadableString } from '../../utils/utilityfunctions';
import DialogContent from '@mui/material/DialogContent';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import { PublicKeyTextField } from './PublicKeyTextField';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { SopsConfig, SopsConfigStatus } from '../../utils/types';
import Typography from '@mui/material/Typography';
import { PublicKeyList } from './PublicKeyList';

interface SopsConfigDialogProps {
  onClose: () => void;
  showDialog: boolean;
  sopsConfig: SopsConfig;
}

export interface SopsConfigDialogFormData {
  gcpProjectId: string;
  publicAgeKeys: string[];
}

export const SopsConfigDialog = ({
  onClose,
  showDialog,
  sopsConfig,
}: SopsConfigDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const titleTranslation =
    sopsConfig.status === SopsConfigStatus.NotCreated
      ? t('sopsConfigDialog.titleNew')
      : t('sopsConfigDialog.titleEdit');

  const [publicKeys, setPublicKeys] = useState<string[]>(
    sopsConfig.publicAgeKeys,
  );
  const publicKeysRef = useRef(publicKeys);

  useEffect(() => {
    if (sopsConfig.status === SopsConfigStatus.NotCreated) {
      publicKeysRef.current = [];
      setPublicKeys(publicKeysRef.current);
      setValue('publicAgeKeys', publicKeysRef.current);
    } else {
      publicKeysRef.current = sopsConfig.publicAgeKeys;
      setPublicKeys(publicKeysRef.current);
      setValue('publicAgeKeys', publicKeysRef.current);
    }
  }, []);

  const handleClickAddKeyButton = () => {
    publicKeysRef.current = [...publicKeys, ''];
    setPublicKeys(publicKeysRef.current);
    setValue('publicAgeKeys', publicKeysRef.current);
  };

  const handleClickDeletePublicKeyTextField = (index: number) => {
    publicKeysRef.current = publicKeys.filter((_, i) => i !== index);
    setPublicKeys(publicKeysRef.current);
    setValue('publicAgeKeys', publicKeysRef.current);
  };

  const handleOnChangePublicKeyTextField = (index: number, value: string) => {
    const updateList = [...publicKeys];
    updateList[index] = value;
    publicKeysRef.current = updateList;
    setPublicKeys(publicKeysRef.current);
    setValue('publicAgeKeys', publicKeysRef.current);
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isDirty, errors },
  } = useForm<SopsConfigDialogFormData>({
    defaultValues: {
      gcpProjectId: sopsConfig.gcpProjectId,
      publicAgeKeys: publicKeys,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'publicAgeKeys',
  });

  const onSubmit = handleSubmit((data: SopsConfigDialogFormData) => {
    console.log(data);
    onClose();
  });

  return (
    <Dialog open={showDialog} onClose={onClose} maxWidth={'md'}>
      <DialogTitle>{titleTranslation}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {sopsConfig.status === SopsConfigStatus.NotCreated && (
          <Typography>{t('sopsConfigDialog.description')}</Typography>
        )}
        <FormLabel>{t('sopsConfigDialog.gcpProjectDescription')}</FormLabel>
        <Controller
          name={'gcpProjectId'}
          control={control}
          rules={{ required: t('sopsConfigDialog.required') }}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={sopsConfig.gcpProjectIds}
              getOptionLabel={(option: string) =>
                gcpProjectIdToReadableString(option)
              }
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

        <PublicKeyList publicKeys={sopsConfig.publicAgeKeys} />

        <FormLabel>{t('sopsConfigDialog.publicAgeKeyDescription')}</FormLabel>
        {fields.map((_field, index) => (
          <Controller
            name={`publicAgeKeys.${index}`}
            control={control}
            render={({ field }) => (
              <PublicKeyTextField
                value={publicKeys[index]}
                index={index}
                field={field}
                onChange={handleOnChangePublicKeyTextField}
                onClick={handleClickDeletePublicKeyTextField}
                minWidth={800}
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
