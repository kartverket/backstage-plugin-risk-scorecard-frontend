import { Input } from '../common/Input';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Typography from '@mui/material/Typography';
import React from 'react';
import { DialogContentText } from '@mui/material';
import { RiScDialogStates } from './RiScDialog';
import Box from '@mui/material/Box';
import { CreateRiScFrom } from './RiScDialog';
import { RiScWithMetadata } from '../../utils/types';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import { UseFormRegister } from 'react-hook-form/dist/types/form';

interface ConfigRiscInfoProps {
  dialogState: RiScDialogStates,
  createRiScFrom: CreateRiScFrom,
  handleChangeCreateRiScFrom: () => void, 
  register: UseFormRegister<RiScWithMetadata>,
  errors: FieldErrors<RiScWithMetadata>
  }

const ConfigRiscInfo = ({dialogState, createRiScFrom, handleChangeCreateRiScFrom, register, errors}: ConfigRiscInfoProps) => {
    const { t } = useTranslationRef(pluginRiScTranslationRef);
    return (
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
    )
}

export default ConfigRiscInfo;