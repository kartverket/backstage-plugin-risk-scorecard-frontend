import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { heading3 } from '../../common/typography';
import { UseFieldArrayRemove, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import {
  actionStatusOptions,
  urlRegExpPattern,
} from '../../../utils/constants';
import { Select } from '../../common/Select';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';

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

  const { control, register, setValue, watch, formState } = formMethods;

  const translatedActionStatuses = actionStatusOptions.map(actionStatus => ({
    value: actionStatus,
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    renderedValue: t(`actionStatus.${actionStatus}`),
  }));

  const currentActionDescription = watch(`actions.${index}.description`);

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
          {...register(`actions.${index}.title`)}
          label={t('dictionary.title')}
        />
        <MarkdownInput
          required
          {...register(`actions.${index}.description`, { required: true })}
          error={formState.errors?.actions?.[index]?.description !== undefined}
          label={t('dictionary.description')}
          value={currentActionDescription}
          onMarkdownChange={value =>
            setValue(`actions.${index}.description`, value)
          }
          minRows={4}
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
            options={translatedActionStatuses}
          />
        </Box>
      </Box>
    </>
  );
}
