import React from 'react';
import { RiSc } from '../../utils/types';
import { emptyRiSc } from '../../utils/utilityfunctions';
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

export enum RiScDialogStates {
  Closed,
  Edit,
  Create,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
}

export const RiScDialog = ({ onClose, dialogState }: RiScDialogProps) => {
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

  const titleTranslation =
    dialogState === RiScDialogStates.Create
      ? t('rosDialog.titleNew')
      : t('rosDialog.titleEdit');

  const onSubmit = handleSubmit((data: RiSc) => {
    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(data);
    } else {
      updateRiSc(data);
    }
    onClose();
  });

  return (
    <Dialog open={dialogState !== RiScDialogStates.Closed} onClose={onClose}>
      <DialogTitle>{titleTranslation}</DialogTitle>

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
      </DialogContent>

      <DialogActions sx={dialogActions}>
        <Button variant="contained" onClick={onSubmit} disabled={!isDirty}>
          {t('dictionary.save')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('dictionary.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
