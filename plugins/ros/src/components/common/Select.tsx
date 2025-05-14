import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MUISelect, { SelectProps } from '@mui/material/Select';
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
  type UseControllerReturn,
} from 'react-hook-form';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { formHelperText, formLabel } from './typography';

type Props<T extends FieldValues> = SelectProps & {
  sublabel?: string;
  helperText?: string;
  control?: Control<T, any>;
  name: Path<T>;
  labelTranslationKey?: string;
  options: { value: string | number; renderedValue: string | number }[];
  rules?: Omit<
    RegisterOptions<T, string & Path<T>>,
    'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
  >;
};

export function Select<T extends FieldValues>({
  label,
  sublabel,
  error,
  helperText,
  required,
  control,
  name,
  multiple,
  labelTranslationKey,
  options,
  rules,
  ...props
}: Props<T>) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name,
    control,
    rules: { ...rules, required },
  });

  // values er strengt tatt unknown, men da må vi bruke mye ts-ignore for å komme i mål
  function renderValue(values: any) {
    if (!multiple) {
      return options.find(option => option.value === values)?.renderedValue;
    }
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        {values.map((value: string) => (
          <Chip
            key={value}
            label={
              /* @ts-ignore Because ts can't typecheck strings against our keys */
              labelTranslationKey ? t(`${labelTranslationKey}.${value}`) : value
            }
          />
        ))}
      </Box>
    );
  }

  function handleChecked(
    fieldValue: UseControllerReturn['field']['value'],
    optionValue: Props<T>['options'][number]['value'],
  ) {
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(optionValue);
    }
    return fieldValue === optionValue;
  }

  return (
    <FormControl error={error} sx={{ width: '100%', gap: '4px' }}>
      {label && (
        <FormLabel sx={formLabel} required={required}>
          {label}
        </FormLabel>
      )}
      {sublabel && (
        <FormHelperText sx={formHelperText}>{sublabel}</FormHelperText>
      )}

      <MUISelect
        MenuProps={{
          disablePortal: true,
        }}
        error={error}
        variant="outlined"
        renderValue={renderValue}
        multiple={multiple}
        SelectDisplayProps={
          multiple
            ? {
                style: {
                  paddingBottom: 8,
                  paddingTop: 16,
                  minHeight: 40,
                },
              }
            : {}
        }
        inputRef={field.ref}
        {...field}
        {...props}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && (
              <Checkbox checked={handleChecked(field.value, option.value)} />
            )}
            <ListItemText primary={option.renderedValue} />
          </MenuItem>
        ))}
      </MUISelect>
      {error && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
}
