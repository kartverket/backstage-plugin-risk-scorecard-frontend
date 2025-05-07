import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  Controller,
  UseFieldArrayRemove,
  UseFormReturn,
} from 'react-hook-form';
import {
  ActionStatusOptions,
  urlRegExpPattern,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { FormScenario } from '../../../utils/types';
import { actionStatusOptionsToTranslationKeys } from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import { heading3 } from '../../common/typography';

type ActionFormItemProps = {
  formMethods: UseFormReturn<FormScenario>;
  index: number;
  remove: UseFieldArrayRemove;
  showTitleNumber?: boolean;
  handleDelete?: () => void;
};

export function ActionFormItem({
  formMethods,
  index,
  remove,
  showTitleNumber = true,
  handleDelete,
}: ActionFormItemProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control, register, formState } = formMethods;

  const actionStatusOptions = Object.values(ActionStatusOptions).map(
    actionStatus => ({
      value: actionStatus,
      /* @ts-ignore Because ts can't typecheck strings against our keys */
      renderedValue: t(actionStatusOptionsToTranslationKeys[actionStatus]),
    }),
  );

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: '24px',
          padding: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {showTitleNumber ? (
            <Typography sx={heading3}>
              {t('dictionary.measure')} {index + 1}
            </Typography>
          ) : (
            <Typography sx={heading3}>{t('dictionary.edit')}</Typography>
          )}
          <IconButton
            onClick={() => (handleDelete ? handleDelete() : remove(index))}
            color="primary"
          >
            <DeleteIcon aria-label="Delete" />
          </IconButton>
        </Box>
        <Input
          required
          {...register(`actions.${index}.title`, { required: true })}
          error={formState.errors?.actions?.[index]?.title !== undefined}
          label={t('dictionary.title')}
        />
        <Controller
          control={control}
          name={`actions.${index}.description`}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MarkdownInput
              label={t('dictionary.description')}
              value={value}
              onMarkdownChange={onChange}
              error={!!error}
              minRows={4}
            />
          )}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
          }}
        >
          <Input
            {...register(`actions.${index}.url`, {
              pattern: {
                value: urlRegExpPattern,
                message: t('scenarioDrawer.action.urlError'),
              },
            })}
            label={t('dictionary.url')}
            helperText={formState.errors.actions?.[index]?.url?.message}
            error={!!formState.errors.actions?.[index]?.url?.message}
          />
          <Select<FormScenario>
            required
            control={control}
            name={`actions.${index}.status`}
            label={t('dictionary.status')}
            options={actionStatusOptions}
          />
        </Box>
      </Box>
    </>
  );
}
