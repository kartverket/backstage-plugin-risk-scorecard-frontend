import { MarkdownInput } from '../common/MarkdownInput';
import { Input } from '../common/Input';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form/dist/types/form';
import { DefaultRiScType, RiScWithMetadata } from '../../utils/types';
import { RiScDialogStates } from './RiScDialog';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import { Divider } from '@mui/material';
import { useDefaultRiScTypeDescriptors } from '../../contexts/DefaultRiScTypesContext.tsx';

interface ConfigRiscInfoProps {
  dialogState: RiScDialogStates;
  register: UseFormRegister<RiScWithMetadata>;
  errors: FieldErrors<RiScWithMetadata>;
  setValue: UseFormSetValue<RiScWithMetadata>;
  watch: UseFormWatch<RiScWithMetadata>;
  selectedRiScType: DefaultRiScType;
}

function ConfigRiscInfo(props: ConfigRiscInfoProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { getDescriptorOfType } = useDefaultRiScTypeDescriptors();
  const descriptor = getDescriptorOfType(props.selectedRiScType);

  const currentScope = props.watch('content.scope');

  return (
    <>
      <Divider />
      <Input
        required
        {...props.register('content.title', { required: true })}
        error={props.errors?.content?.title !== undefined}
        label={t('dictionary.title')}
        helperText={props.errors?.content?.title && t('rosDialog.titleError')}
      />
      <MarkdownInput
        {...props.register('content.scope')}
        value={currentScope}
        label={t('dictionary.scope')}
        sublabel={t('rosDialog.scopeDescription')}
        error={props.errors?.content?.scope !== undefined}
        minRows={8}
        onMarkdownChange={value => props.setValue('content.scope', value)}
      />
      <p>{descriptor?.defaultScope || ''}</p>
      <p>{descriptor?.defaultTitle || ''}</p>
    </>
  );
}

export default ConfigRiscInfo;
