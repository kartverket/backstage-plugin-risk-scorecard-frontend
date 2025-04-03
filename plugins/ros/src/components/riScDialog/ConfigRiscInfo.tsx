import React from 'react';
import { MarkdownInput } from '../common/MarkdownInput';
import { Input } from '../common/Input';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form/dist/types/form';
import { RiScWithMetadata } from '../../utils/types';
import { CreateRiScFrom, RiScDialogStates } from './RiScDialog';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { DialogContentText } from '@mui/material';
import { FieldErrors } from 'react-hook-form/dist/types/errors';

interface ConfigRiscInfoProps {
  dialogState: RiScDialogStates;
  createRiScFrom: CreateRiScFrom;
  handleChangeCreateRiScFrom: () => void;
  register: UseFormRegister<RiScWithMetadata>;
  errors: FieldErrors<RiScWithMetadata>;
  setValue: UseFormSetValue<RiScWithMetadata>;
  watch: UseFormWatch<RiScWithMetadata>;
}

const ConfigRiscInfo = ({
  dialogState,
  createRiScFrom,
  handleChangeCreateRiScFrom,
  register,
  errors,
  setValue,
  watch,
}: ConfigRiscInfoProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const currentScope = watch('content.scope');

  return (
    <>
      <Input
        required
        {...register('content.title', { required: true })}
        error={errors?.content?.title !== undefined}
        label={t('dictionary.title')}
        minRows={4}
      />
      <MarkdownInput
        required
        {...register('content.scope', { required: true })}
        value={currentScope}
        label={t('dictionary.scope')}
        sublabel={t('rosDialog.scopeDescription')}
        error={errors?.content?.scope !== undefined}
        minRows={8}
        onMarkdownChange={value => setValue('content.scope', value)}
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
              control={<Switch onChange={() => handleChangeCreateRiScFrom()} />}
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
  );
};

export default ConfigRiscInfo;
