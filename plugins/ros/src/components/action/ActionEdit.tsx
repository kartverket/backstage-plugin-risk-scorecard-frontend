import Button from '@mui/material/Button';
import { Action } from '../../utils/types.ts';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import { ActionFormItem } from '../scenarioDrawer/components/ActionFormItem.tsx';

type ActionEditProps = {
  action: Action;
  onCancelEdit: () => void;
  onSaveAction: (newAction: Action) => void;
  onDeleteAction: () => void;
  onFormSubmitted?: () => void;
};

type ActionEditForm = {
  title: string;
  description: string;
  status: string;
  url: string;
};

export function ActionEdit(props: ActionEditProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const formMethods = useForm<ActionEditForm>({
    defaultValues: {
      title: props.action.title,
      description: props.action.description,
      status: props.action.status,
      url: props.action.url,
    },
  });
  const { updateStatus } = useRiScs();

  const onSubmit: SubmitHandler<ActionEditForm> = data => {
    const newAction = {
      ...props.action,
      ...data,
    };
    props.onSaveAction(newAction);
  };

  return (
    <>
      <ActionFormItem
        formMethods={formMethods}
        handleDelete={props.onDeleteAction}
      />
      <Box display="flex" gap={1}>
        <Button
          color="primary"
          variant="contained"
          onClick={formMethods.handleSubmit(onSubmit)}
          disabled={!formMethods.formState.isDirty || updateStatus.isLoading}
        >
          {t('dictionary.save')}
          {updateStatus.isLoading && (
            <CircularProgress
              size={16}
              sx={{ marginLeft: 8, color: 'inherit' }}
            />
          )}
        </Button>
        <Button onClick={props.onCancelEdit}>{t('dictionary.cancel')}</Button>
      </Box>
    </>
  );
}
