import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Input } from '../common/Input';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import { useForm } from 'react-hook-form';
import { RiSc } from '../../utils/types';
import { RiScDialogProps, RiScDialogStates } from './RiScDialog';
import { useRiScs } from '../../contexts/RiScContext';
import { emptyRiSc } from '../../utils/utilityfunctions';



export const CreateNewFromScratchTabPanel = ({
  onClose,
  dialogState,
}: RiScDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc, createNewRiSc, updateRiSc } = useRiScs();

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<RiSc>({
    defaultValues:
      dialogState === RiScDialogStates.Edit
        ? selectedRiSc!.content
        : emptyRiSc(),
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((data: RiSc) => {
    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(data);
    } else {
      updateRiSc(data);
    }
    onClose();
  });

  return (
    <DialogContent
      sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <Input
        required
        {...register('title', { required: true })}
        error={errors.title !== undefined}
        label={t('dictionary.title')}
      />
      <Input
        required
        {...register('scope', { required: true })}
        label={t('dictionary.scope')}
        sublabel={t('rosDialog.scopeDescription')}
        error={errors.scope !== undefined}
        minRows={4}
      />
      <DialogActions sx={dialogActions}>
        <Button variant="contained" onClick={onSubmit} disabled={!isDirty}>
          {t('rosDialog.lagNyFraScratch')}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};
