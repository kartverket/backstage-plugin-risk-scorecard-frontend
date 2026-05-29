import { useEffect, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  parseEntityRef,
  RELATION_PART_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  catalogApiRef,
  EntityRefLink,
  useEntity,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import {
  Alert,
  Button,
  ButtonIcon,
  Card,
  CardBody,
  Flex,
  Text,
} from '@backstage/ui';
import Autocomplete from '@mui/material/Autocomplete';
import Chip, { ChipProps } from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';
import { useSystemRiScsFeatureFlag } from '../../utils/featureFlags';
import { RiScWithMetadata } from '../../utils/types';
import formStyles from '../common/formStyles.module.css';
import {
  entityRefOptionFields,
  getCurrentSystemRef,
} from '../riScDialog/entityRefOptions';

const backstageAppliesToPrefix = 'backstage:';

export function AppliesToCard() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const isSystemRiScsEnabled = useSystemRiScsFeatureFlag();
  const { selectedRiSc, updateRiSc, updateStatus } = useRiScs();
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset, formState } = useForm<RiScWithMetadata>(
    {
      defaultValues: selectedRiSc ?? undefined,
      mode: 'onBlur',
    },
  );

  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const includeAllEntities =
    configApi.getOptionalBoolean(
      'riskScorecard.appliesTo.includeAllEntities',
    ) ?? false;
  const [catalogEntityRefs, setCatalogEntityRefs] = useState<string[]>([]);
  const [titlesByRef, setTitlesByRef] = useState<Map<string, string>>(
    new Map(),
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const { field, fieldState } = useController({
    control,
    name: 'content.unencryptedMetadata.appliesTo',
  });
  const { entity } = useEntity();
  const currentEntityRef = stringifyEntityRef(entity);
  const currentPrefixedEntityRef = backstageAppliesToPrefix + currentEntityRef;

  // Only fetch catalog options while editing; the read-only view needs none.
  useEffect(() => {
    if (!isEditing) {
      setIsLoadingOptions(false);
      setCatalogEntityRefs([]);
      setTitlesByRef(new Map());
      return undefined;
    }

    let cancelled = false;
    const currentSystemRef = getCurrentSystemRef(entity);
    setIsLoadingOptions(true);
    setCatalogEntityRefs([]);
    setTitlesByRef(new Map());

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
      includeAllEntities
        ? catalogApi.getEntities({
            fields: entityRefOptionFields,
          })
        : Promise.resolve({ items: [] }),
    ])
      .then(([sameSystemEntitiesResponse, allEntitiesResponse]) => {
        if (cancelled) {
          return;
        }

        const fetchedEntities = [
          ...sameSystemEntitiesResponse.items,
          ...allEntitiesResponse.items,
        ];
        const titles = new Map<string, string>();
        fetchedEntities.forEach(optionEntity => {
          const prefixedRef =
            backstageAppliesToPrefix + stringifyEntityRef(optionEntity);
          titles.set(
            prefixedRef,
            optionEntity.metadata.title ?? optionEntity.metadata.name,
          );
        });

        setCatalogEntityRefs(Array.from(titles.keys()));
        setTitlesByRef(titles);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogEntityRefs([]);
          setTitlesByRef(new Map());
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
  }, [isEditing, catalogApi, entity, includeAllEntities]);

  if (!isSystemRiScsEnabled || !selectedRiSc) {
    return null;
  }

  // Ensure that it always looks as if currentRef is saved, but we only save it if at least two refs are selected
  const selectedEntityRefs = field.value ?? [currentPrefixedEntityRef];
  const isMissingCurrentEntityRef = getIsMissingCurrentEntityRef(
    selectedEntityRefs,
    currentPrefixedEntityRef,
  );
  // Avoid missing-entity warnings until catalog refs have loaded. On an entity
  // page, a successful fetch should at least contain the current entity.
  const missingEntityRefs =
    catalogEntityRefs.length > 0
      ? getMissingEntityRefs(
          selectedEntityRefs.filter(ref => ref !== currentPrefixedEntityRef),
          catalogEntityRefs,
        )
      : [];

  // The view is sourced from selectedRiSc (not the form) so it cannot go stale
  // after a same-id update where the keyed component does not remount.
  const viewRefs = selectedRiSc.content.unencryptedMetadata?.appliesTo ?? [
    currentPrefixedEntityRef,
  ];
  const orderedViewRefs = [
    ...viewRefs.filter(ref => ref === currentPrefixedEntityRef),
    ...viewRefs.filter(ref => ref !== currentPrefixedEntityRef),
  ];

  function handleChange(_: unknown, value: string[]) {
    field.onChange(
      ensureNullOrCurrentEntityRefAsHead(value, currentPrefixedEntityRef),
    );
  }

  // Clear the dirty state and return to view on a successful save. On failure we
  // stay in edit mode with the user's edits preserved (the error is surfaced by
  // the global AlertBar in RiScPlugin).
  const onSave = handleSubmit(data =>
    updateRiSc(data, () => {
      reset(data);
      setIsEditing(false);
    }),
  );

  function onEdit() {
    reset(selectedRiSc ?? undefined);
    setIsEditing(true);
  }

  function onCancel() {
    reset(selectedRiSc ?? undefined);
    setIsEditing(false);
  }

  return (
    <Card>
      <CardBody>
        <FormControl className={formStyles.formControl}>
          <Flex justify="between" align="center">
            <Text variant="title-small" weight="bold" as="h5">
              {t('rosDialog.appliesTo')}
            </Text>
            <FormLabel className={formStyles.formLabel} />
            {!isEditing && (
              <ButtonIcon
                onClick={onEdit}
                icon={
                  <i className="ri-edit-line" style={{ fontSize: 'large' }} />
                }
                variant="tertiary"
              />
            )}
          </Flex>
          <FormHelperText className={formStyles.formHelperText}>
            {t('rosDialog.appliesToDescription')}
          </FormHelperText>
          {isEditing ? (
            <>
              <Autocomplete<string, true, false, false>
                multiple
                filterSelectedOptions
                loading={isLoadingOptions}
                options={catalogEntityRefs}
                value={selectedEntityRefs}
                getOptionLabel={prefixedEntityRef =>
                  formatEntityLabel(
                    titlesByRef.get(prefixedEntityRef) ??
                      getEntityName(prefixedEntityRef),
                    getEntityKind(prefixedEntityRef),
                  )
                }
                isOptionEqualToValue={(option, value) => option === value}
                onChange={handleChange}
                renderValue={(value, getItemProps) =>
                  value.map((prefixedEntityRef, index) => {
                    const { key, onDelete, ...restTagProps } = getItemProps({
                      index,
                    });
                    const isCurrentEntity =
                      prefixedEntityRef === currentPrefixedEntityRef;

                    return (
                      <AppliesToChip
                        key={key}
                        prefixedEntityRef={prefixedEntityRef}
                        isCurrentEntity={isCurrentEntity}
                        onDelete={isCurrentEntity ? undefined : onDelete}
                        {...restTagProps}
                      />
                    );
                  })
                }
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder={t('rosDialog.appliesToPlaceholder')}
                  />
                )}
                loadingText={t('rosDialog.appliesToLoading')}
                noOptionsText={t('rosDialog.appliesToNoOptions')}
              />
              {selectedEntityRefs.length > 1 && (
                <FormHelperText>
                  {t('rosDialog.appliesToSystemRosHint')}
                </FormHelperText>
              )}
              {fieldState.isDirty && (
                <Alert
                  status="info"
                  icon
                  description={t('rosDialog.appliesToNightlyRefreshHint')}
                />
              )}
              {isMissingCurrentEntityRef && (
                <Alert
                  status="warning"
                  icon
                  description={t('rosDialog.appliesToMissingCurrentEntity', {
                    entityRef: currentEntityRef,
                  })}
                />
              )}
              {missingEntityRefs.length > 0 && (
                <Alert
                  status="warning"
                  icon
                  description={t('rosDialog.appliesToMissingEntities', {
                    entityRefs: missingEntityRefs
                      .map(prefixedEntityRef =>
                        formatEntityLabel(
                          getEntityName(prefixedEntityRef),
                          getEntityKind(prefixedEntityRef),
                        ),
                      )
                      .join(', '),
                  })}
                />
              )}
            </>
          ) : (
            <Flex gap="8px" style={{ flexWrap: 'wrap' }}>
              {orderedViewRefs.map(prefixedEntityRef => (
                <EntityRefLink
                  key={prefixedEntityRef}
                  entityRef={stripAppliesToPrefix(prefixedEntityRef)}
                >
                  <AppliesToChip
                    clickable
                    prefixedEntityRef={prefixedEntityRef}
                    isCurrentEntity={
                      prefixedEntityRef === currentPrefixedEntityRef
                    }
                  />
                </EntityRefLink>
              ))}
            </Flex>
          )}
        </FormControl>
        {isEditing && (
          <Flex justify="end" gap="8px" pt="16px">
            <Button size="medium" variant="secondary" onClick={onCancel}>
              {t('dictionary.cancel')}
            </Button>
            <Button
              size="medium"
              variant="primary"
              onClick={onSave}
              isDisabled={!formState.isDirty || updateStatus.isLoading}
            >
              {t('dictionary.save')}
            </Button>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}

function ensureNullOrCurrentEntityRefAsHead(
  entityRefs: string[],
  currentEntityRef: string,
): string[] | null {
  const currentValue = [
    currentEntityRef,
    ...new Set(entityRefs.filter(it => it !== currentEntityRef)),
  ];
  if (currentValue.length === 1) {
    // React Hook Form does not support undefined field values; DTO serialization normalizes null by omitting appliesTo.
    return null;
  }

  return currentValue;
}

function stripAppliesToPrefix(prefixedEntityRef: string): string {
  return prefixedEntityRef.startsWith(backstageAppliesToPrefix)
    ? prefixedEntityRef.slice(backstageAppliesToPrefix.length)
    : prefixedEntityRef;
}

function getEntityKind(prefixedEntityRef: string): string {
  return parseEntityRef(stripAppliesToPrefix(prefixedEntityRef)).kind;
}

function getEntityName(prefixedEntityRef: string): string {
  return parseEntityRef(stripAppliesToPrefix(prefixedEntityRef)).name;
}

function formatEntityLabel(title: string, kind: string): string {
  const capitalizedKind = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `${title} (${capitalizedKind})`;
}

type AppliesToChipProps = {
  prefixedEntityRef: string;
  isCurrentEntity: boolean;
} & Omit<ChipProps, 'label' | 'color' | 'variant'>;

// Resolves the entity title via useEntityPresentation (metadata.title, else the
// humanized name) so it can be called per-ref. Used by both the read-only view
// and the edit-mode selected chips.
function AppliesToChip({
  prefixedEntityRef,
  isCurrentEntity,
  ...chipProps
}: AppliesToChipProps) {
  const { primaryTitle } = useEntityPresentation(
    stripAppliesToPrefix(prefixedEntityRef),
  );

  return (
    <Chip
      label={formatEntityLabel(primaryTitle, getEntityKind(prefixedEntityRef))}
      color={isCurrentEntity ? 'primary' : 'default'}
      variant={isCurrentEntity ? 'filled' : 'outlined'}
      {...chipProps}
    />
  );
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
