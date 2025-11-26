import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  ActionStatusOptions,
  urlRegExpPattern,
} from '../../../utils/constants';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import {
  actionStatusOptionsToTranslationKeys,
  getValue,
} from '../../../utils/utilityfunctions';
import { Input } from '../../common/Input';
import { MarkdownInput } from '../../common/MarkdownInput';
import { Select } from '../../common/Select';
import HelpIcon from '@mui/icons-material/Help';
import { Tooltip } from '@material-ui/core';
import { Text } from '@backstage/ui';

function getObjectPath(formIndex?: number) {
  if (!formIndex) return '';
  return `actions.${formIndex}.`;
}

type ActionFormItemProps = {
  formMethods: UseFormReturn<any>;
  handleDelete: () => void;
  displayedIndex?: number;
  // Use formIndex if the action is nested in a scenario object. i.e. {actions: [], ...}
  formIndex?: number;
};

export function ActionFormItem({
  formMethods,
  handleDelete,
  displayedIndex,
  formIndex,
}: ActionFormItemProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { control, register, formState } = formMethods;
  const errorObject = getValue(
    formState.errors,
    formIndex ? `actions.${formIndex}` : '',
  );

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
          {displayedIndex ? (
            <Text variant="title-x-small" weight="bold">
              {t('dictionary.measure')} {displayedIndex + 1}
            </Text>
          ) : (
            <Text variant="title-x-small" weight="bold">
              {t('dictionary.edit')}
            </Text>
          )}
          <IconButton onClick={handleDelete} color="primary">
            <DeleteIcon aria-label="Delete" />
          </IconButton>
        </Box>
        <Input
          required
          {...register(`${getObjectPath(formIndex)}title`, {
            required: true,
          })}
          error={errorObject?.title !== undefined}
          label={t('dictionary.title')}
          helperText={
            errorObject?.title &&
            t('scenarioDrawer.measureTab.addMeasureTitleError')
          }
        />
        <Controller
          control={control}
          name={`${getObjectPath(formIndex)}description`}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MarkdownInput
              label={t('dictionary.description')}
              value={value}
              onMarkdownChange={onChange}
              error={!!error}
              minRows={8}
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
            {...register(`${getObjectPath(formIndex)}url`, {
              pattern: {
                value: urlRegExpPattern,
                message: t('scenarioDrawer.action.urlError'),
              },
            })}
            label={<UrlLabel />}
            helperText={errorObject?.url?.message}
            error={errorObject?.url?.message}
          />
          <Select
            required
            control={control}
            name={`${getObjectPath(formIndex)}status`}
            label={t('dictionary.status')}
            options={actionStatusOptions}
          />
        </Box>
      </Box>
    </>
  );
}

export function UrlLabel(): JSX.Element {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }}
    >
      {t('dictionary.url')}
      <Tooltip
        title={
          <Text variant="body-large" style={{ color: 'white' }}>
            {t('scenarioDrawer.measureTab.urlDescription')}
          </Text>
        }
        arrow
      >
        <HelpIcon color="primary" />
      </Tooltip>
    </Box>
  );
}
