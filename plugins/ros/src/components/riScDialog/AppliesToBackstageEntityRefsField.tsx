import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RELATION_PART_OF, stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScWithMetadata } from '../../utils/types';
import formStyles from '../common/formStyles.module.css';
import { entityRefOptionFields, getCurrentSystemRef } from './entityRefOptions';

type AppliesToBackstageEntityRefsFieldProps = {
  control: Control<RiScWithMetadata>;
};

export function AppliesToBackstageEntityRefsField({
  control,
}: AppliesToBackstageEntityRefsFieldProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const catalogApi = useApi(catalogApiRef);
  const [catalogEntityRefs, setCatalogEntityRefs] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const { field } = useController({
    control,
    name: 'content.appliesToBackstageEntityRefs',
  });
  const { entity } = useEntity();
  const currentEntityRef = stringifyEntityRef(entity);
  // Ensure that it always looks as if currentRef is saved, but we only save it if at least two refs are selected
  const selectedEntityRefs = field.value ?? [currentEntityRef];
  const isMissingCurrentEntityRef = getIsMissingCurrentEntityRef(
    selectedEntityRefs,
    currentEntityRef,
  );
  // Avoid missing-entity warnings until catalog refs have loaded. On an entity
  // page, a successful fetch should at least contain the current entity.
  const missingEntityRefs =
    catalogEntityRefs.length > 0
      ? getMissingEntityRefs(selectedEntityRefs, catalogEntityRefs)
      : [];

  useEffect(() => {
    let cancelled = false;
    const currentSystemRef = getCurrentSystemRef(entity);
    setIsLoadingOptions(true);
    setCatalogEntityRefs([]);

    const sameSystemEntitiesPromise = currentSystemRef
      ? catalogApi
          .getEntities({
            fields: entityRefOptionFields,
            filter: {
              [`relations.${RELATION_PART_OF}`]: currentSystemRef,
            },
          })
          .catch(() => ({ items: [] }))
      : Promise.resolve({ items: [] });

    Promise.all([
      sameSystemEntitiesPromise,
      catalogApi.getEntities({
        fields: entityRefOptionFields,
      }),
    ])
      .then(([sameSystemEntitiesResponse, allEntitiesResponse]) => {
        if (cancelled) {
          return;
        }

        setCatalogEntityRefs(
          Array.from(
            new Set(
              [
                ...sameSystemEntitiesResponse.items,
                ...allEntitiesResponse.items,
              ].map(stringifyEntityRef),
            ),
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
  }, [catalogApi, entity]);

  function handleChange(_: unknown, value: string[]) {
    field.onChange(
      ensureUndefinedOrCurrentEntityRefAsHead(value, currentEntityRef),
    );
  }

  const hasSystemRiScScope = selectedEntityRefs.length > 1;

  return (
    <FormControl className={formStyles.formControl}>
      <FormLabel className={formStyles.formLabel}>
        {t('rosDialog.appliesToBackstageEntityRefs')}
      </FormLabel>
      <FormHelperText className={formStyles.formHelperText}>
        {t('rosDialog.appliesToBackstageEntityRefsDescription')}
      </FormHelperText>
      <Autocomplete<string, true, false, false>
        multiple
        disablePortal
        filterSelectedOptions
        loading={isLoadingOptions}
        options={catalogEntityRefs}
        value={selectedEntityRefs}
        getOptionLabel={option => option}
        isOptionEqualToValue={(option, value) => option === value}
        onChange={handleChange}
        renderValue={(value, getItemProps) =>
          value.map((entityRef, index) => {
            const tagProps = getItemProps({ index });
            const { key, onDelete, ...restTagProps } = tagProps;
            const isCurrentEntity = entityRef === currentEntityRef;

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
      {isMissingCurrentEntityRef && (
        <Alert severity="warning">
          {t('rosDialog.appliesToBackstageEntityRefsMissingCurrentEntity', {
            entityRef: currentEntityRef,
          })}
        </Alert>
      )}
      {missingEntityRefs.length > 0 && (
        <Alert severity="warning">
          {t('rosDialog.appliesToBackstageEntityRefsMissingEntities', {
            entityRefs: missingEntityRefs.join(', '),
          })}
        </Alert>
      )}
    </FormControl>
  );
}

function ensureUndefinedOrCurrentEntityRefAsHead(
  entityRefs: string[],
  currentEntityRef: string,
): string[] | null {
  const currentValue = [
    currentEntityRef,
    ...new Set(entityRefs.filter(it => it !== currentEntityRef)),
  ];
  if (currentValue.length === 1) {
    return null;
  }

  return currentValue;
}

function getIsMissingCurrentEntityRef(
  entityRefs: string[],
  currentEntityRef: string,
): boolean {
  return entityRefs.length > 0 && !entityRefs.includes(currentEntityRef);
}

function getMissingEntityRefs(
  entityRefs: string[],
  catalogEntityRefs: string[],
): string[] {
  return entityRefs.filter(entityRef => !catalogEntityRefs.includes(entityRef));
}
