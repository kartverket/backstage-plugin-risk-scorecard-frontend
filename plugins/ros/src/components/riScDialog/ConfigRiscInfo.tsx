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
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import { Divider } from '@mui/material';

interface ConfigRiscInfoProps {
  dialogState: RiScDialogStates;
  createRiScFrom: CreateRiScFrom;
  register: UseFormRegister<RiScWithMetadata>;
  errors: FieldErrors<RiScWithMetadata>;
  setValue: UseFormSetValue<RiScWithMetadata>;
  watch: UseFormWatch<RiScWithMetadata>;
}

function ConfigRiscInfo({
  register,
  errors,
  setValue,
  watch,
}: ConfigRiscInfoProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const currentScope = watch('content.scope');

  return (
    <>
      <Divider />
      <Input
        required
        {...register('content.title', { required: true })}
        error={errors?.content?.title !== undefined}
        label={t('dictionary.title')}
        helperText={errors?.content?.title && t('rosDialog.titleError')}
      />
      <MarkdownInput
        {...register('content.scope')}
        value={currentScope}
        label={t('dictionary.scope')}
        sublabel={t('rosDialog.scopeDescription')}
        error={errors?.content?.scope !== undefined}
        minRows={8}
        onMarkdownChange={value => setValue('content.scope', value)}
      />
    </>
  );
}

export default ConfigRiscInfo;
