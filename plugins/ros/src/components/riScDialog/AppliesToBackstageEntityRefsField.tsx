import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScWithMetadata } from '../../utils/types';
import formStyles from '../common/formStyles.module.css';

type AppliesToBackstageEntityRefsFieldProps = {
  control: Control<RiScWithMetadata>;
  currentEntityRef: string | undefined;
};

export function AppliesToBackstageEntityRefsField({
  control,
  currentEntityRef,
}: AppliesToBackstageEntityRefsFieldProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const catalogApi = useApi(catalogApiRef);
  const [catalogEntityRefs, setCatalogEntityRefs] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const { field } = useController({
    control,
    name: 'content.appliesToBackstageEntityRefs',
  });

  const normalizedCurrentEntityRef = normalizeEntityRef(currentEntityRef);
  const selectedEntityRefs = useMemo(
    () => ensureCurrentEntityRef(field.value ?? [], normalizedCurrentEntityRef),
    [field.value, normalizedCurrentEntityRef],
  );
  const entityRefOptions = useMemo(
    () => mergeEntityRefs(selectedEntityRefs, catalogEntityRefs),
    [catalogEntityRefs, selectedEntityRefs],
  );

  useEffect(() => {
    if (!areSameRefs(field.value ?? [], selectedEntityRefs)) {
      field.onChange(selectedEntityRefs);
    }
  }, [field, selectedEntityRefs]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingOptions(true);

    catalogApi
      .getEntities({
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      })
      .then(response => {
        if (cancelled) {
          return;
        }

        setCatalogEntityRefs(
          mergeEntityRefs(
            response.items.map(stringifyEntityRef),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogEntityRefs([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [catalogApi]);

  function handleChange(_: unknown, value: string[]) {
    field.onChange(ensureCurrentEntityRef(value, normalizedCurrentEntityRef));
  }

  const hasSystemRiScScope =
    normalizedCurrentEntityRef !== undefined && selectedEntityRefs.length > 1;

  return (
    <FormControl className={formStyles.formControl}>
      <FormLabel className={formStyles.formLabel}>
        {t('rosDialog.appliesToBackstageEntityRefs')}
      </FormLabel>
      <FormHelperText className={formStyles.formHelperText}>
        {t('rosDialog.appliesToBackstageEntityRefsDescription')}
      </FormHelperText>
      <Autocomplete<string, true, false, true>
        multiple
        freeSolo
        disablePortal
        filterSelectedOptions
        loading={isLoadingOptions}
        options={entityRefOptions}
        value={selectedEntityRefs}
        getOptionLabel={option => option}
        isOptionEqualToValue={(option, value) => option === value}
        onChange={handleChange}
        renderValue={(value, getItemProps) =>
          value.map((entityRef, index) => {
            const tagProps = getItemProps({ index });
            const { key, onDelete, ...restTagProps } = tagProps;
            const isCurrentEntity = entityRef === normalizedCurrentEntityRef;

            return (
              <Chip
                key={key}
                label={entityRef}
                color={isCurrentEntity ? 'primary' : 'default'}
                variant={isCurrentEntity ? 'filled' : 'outlined'}
                onDelete={isCurrentEntity ? undefined : onDelete}
                {...restTagProps}
              />
            );
          })
        }
        renderInput={params => (
          <TextField
            {...params}
            placeholder={t('rosDialog.appliesToBackstageEntityRefsPlaceholder')}
          />
        )}
        loadingText={t('rosDialog.appliesToBackstageEntityRefsLoading')}
        noOptionsText={t('rosDialog.appliesToBackstageEntityRefsNoOptions')}
      />
      {hasSystemRiScScope && (
        <FormHelperText>
          {t('rosDialog.appliesToBackstageEntityRefsSystemRosHint')}
        </FormHelperText>
      )}
    </FormControl>
  );
}

function ensureCurrentEntityRef(
  entityRefs: string[],
  currentEntityRef: string | undefined,
): string[] {
  return mergeEntityRefs(
    currentEntityRef ? [currentEntityRef] : [],
    entityRefs,
  );
}

function mergeEntityRefs(...entityRefLists: string[][]): string[] {
  const refs = new Set<string>();

  for (const entityRefList of entityRefLists) {
    for (const entityRef of entityRefList) {
      const normalizedRef = normalizeEntityRef(entityRef);

      if (normalizedRef) {
        refs.add(normalizedRef);
      }
    }
  }

  return [...refs];
}

function normalizeEntityRef(entityRef: string | undefined) {
  const trimmedRef = entityRef?.trim();

  if (!trimmedRef) {
    return undefined;
  }

  try {
    return stringifyEntityRef(
      parseEntityRef(trimmedRef, { defaultNamespace: 'default' }),
    );
  } catch {
    return undefined;
  }
}

function areSameRefs(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((entityRef, index) => entityRef === second[index])
  );
}
