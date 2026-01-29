import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from '@mui/material';
import { GcpCryptoKeyRadioGroup } from '../sopsConfigDialog/GcpCryptoKeyRadioGroup';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { AddCircle, ExpandMore } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  CryptoKeyPermission,
  GcpCryptoKeyObject,
  SopsConfigDTO,
} from '../../utils/DTOs';
import { useEffect, useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { RiScDialogStates } from './RiScDialog';
import { isPublicAgeKeyValid } from '../../utils/utilityfunctions';
import { FieldErrors } from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';
import { URLS } from '../../urls';
import { Text, Link, Button, Flex, Box } from '@backstage/ui';
import styles from '../riScDialog/RiScDialog.module.css';

interface ConfigEncryptionDialogProps {
  gcpCryptoKeys: GcpCryptoKeyObject[];
  sopsData?: SopsConfigDTO;
  setValue: UseFormSetValue<RiScWithMetadata>;
  register: UseFormRegister<RiScWithMetadata>;
  errors: FieldErrors<RiScWithMetadata>;
  state: RiScDialogStates;
}

function ConfigEncryptionDialog({
  gcpCryptoKeys,
  sopsData,
  setValue,
  register,
  errors,
  state,
}: ConfigEncryptionDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [publicAgeKeyHelperText, setPublicKeyTextFieldHelperText] =
    useState('');
  const [publicAgeKeyError, setPublicKeyTextFieldError] = useState(false);
  const [newPublicAgeKey, setNewPublicAgeKey] = useState('');
  const [publicAgeKeys, setPublicAgeKeys] = useState<string[]>(() => {
    if (sopsData?.age) {
      return sopsData.age.map(age => age.recipient);
    }
    return [];
  });

  // The RiSc may have been encrypted with a key that
  // no longer matches the naming convention of keys
  // returned from the backend. But we still want to show
  // that key as an option in the radio group, so we
  // build a key object from the sops data of the RiSc if needed.
  const riscCryptoKey =
    state === RiScDialogStates.EditEncryption && sopsData?.gcp_kms
      ? (gcpCryptoKeys.find(
          key => key.resourceId === sopsData.gcp_kms![0].resource_id,
        ) ?? buildKeyFromSopsData(sopsData))
      : undefined;

  const choosableCryptoKeys = riscCryptoKey
    ? [
        riscCryptoKey,
        ...gcpCryptoKeys.filter(
          key => key.resourceId !== riscCryptoKey.resourceId,
        ),
      ]
    : gcpCryptoKeys;

  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] = useState<
    GcpCryptoKeyObject | undefined
  >(() => {
    if (state === RiScDialogStates.EditEncryption && sopsData?.gcp_kms) {
      const gcpKms = sopsData.gcp_kms[0];
      return choosableCryptoKeys.find(
        key => key.resourceId === gcpKms?.resource_id,
      );
    }
    return gcpCryptoKeys[0];
  });

  const [isAddPublicAgeKeyVisible, setIsAddPublicAgeKeyVisible] =
    useState(false);

  function showAddPublicAgeKey() {
    setIsAddPublicAgeKeyVisible(true);
  }

  useEffect(() => {
    setValue('sopsConfig', {
      shamir_threshold: 2,
      gcp_kms: chosenGcpCryptoKey
        ? [
            {
              resource_id: chosenGcpCryptoKey.resourceId,
              created_at: chosenGcpCryptoKey.createdAt,
            },
          ]
        : [],
      age: publicAgeKeys.map(key => ({ recipient: key })),
    });
  }, [chosenGcpCryptoKey, publicAgeKeys, setValue]);

  // Require one key group to contain a GCP key
  register('sopsConfig.gcp_kms', {
    validate: gcpKeys => gcpKeys.length > 0,
  });

  function handleChangeGcpCryptoKey(newKey: GcpCryptoKeyObject) {
    setChosenGcpCryptoKey(newKey);
  }

  function handleAddPublicAgeKey() {
    if (isPublicAgeKeyValid(newPublicAgeKey)) {
      if (publicAgeKeys.includes(newPublicAgeKey)) {
        setPublicKeyTextFieldHelperText(
          t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExistInSopsConfig'),
        );
        setPublicKeyTextFieldError(true);
      } else {
        setPublicAgeKeys([...publicAgeKeys, newPublicAgeKey]);
        setNewPublicAgeKey('');
      }
    } else {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyNotValid'),
      );
      setPublicKeyTextFieldError(true);
    }
  }

  return (
    <Flex direction="column">
      <Text>
        {state === RiScDialogStates.Create
          ? t('sopsConfigDialog.description.new')
          : t('sopsConfigDialog.description.edit')}
      </Text>
      <Flex direction="column" gap="0px">
        <Text variant="body-medium" weight="bold">
          {t('sopsConfigDialog.selectKeysTitle')}
        </Text>
        <GcpCryptoKeyRadioGroup
          chosenGcpCryptoKey={chosenGcpCryptoKey}
          onChange={handleChangeGcpCryptoKey}
          gcpCryptoKeys={choosableCryptoKeys}
        />
      </Flex>
      {errors.sopsConfig !== undefined && (
        <FormHelperText error={true}>
          {t('sopsConfigDialog.gcpCryptoKeyNonSelectedErrorMessage')}
        </FormHelperText>
      )}
      <Box className={styles.accordionContainer}>
        <Accordion elevation={0} defaultExpanded={publicAgeKeys.length > 0}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            {t('sopsConfigDialog.publicAgeKeyQuestion')}
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {publicAgeKeys.length > 0 && (
                <FormLabel>
                  {t('sopsConfigDialog.publicAgeKeysAlreadyPresent')}
                </FormLabel>
              )}
              {publicAgeKeys.length > 0 && (
                <Box
                  style={{
                    border: '1px solid',
                    borderRadius: '4px',
                    marginBottom: 2,
                  }}
                >
                  <List>
                    {publicAgeKeys.map(key => (
                      <ListItem key={key} dense>
                        <ListItemText>{key}</ListItemText>
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={() => {
                              setPublicAgeKeys(
                                publicAgeKeys.filter(k => k !== key),
                              );
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              <Text as="p" variant="body-large">
                {t('dictionary.click')}{' '}
                <Link
                  href={
                    URLS.external.kartverket_atlassian_net__write_ros_locally
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  {t('dictionary.here')}
                </Link>{' '}
                {t('sopsConfigDialog.writeLocalRiscSuffix')}
              </Text>
              <Text as="p" variant="body-large">
                {`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
                  'dictionary.optional',
                )})`}{' '}
              </Text>
              <Flex direction="column" justify="between" gap="2" mt="2">
                {!isAddPublicAgeKeyVisible && (
                  <Button
                    iconStart={<AddCircle />}
                    type="button"
                    variant="secondary"
                    onClick={showAddPublicAgeKey}
                    style={{
                      width: 'fit-content',
                      marginTop: '1rem',
                    }}
                  >
                    {t('sopsConfigDialog.addPublicAgeKey')}
                  </Button>
                )}
                {isAddPublicAgeKeyVisible && (
                  <Flex align="center" gap="1">
                    <TextField
                      label={t('sopsConfigDialog.publicAgeKey')}
                      helperText={publicAgeKeyHelperText}
                      error={publicAgeKeyError}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleAddPublicAgeKey();
                        }
                      }}
                      onFocus={() => {
                        setPublicKeyTextFieldError(false);
                        setPublicKeyTextFieldHelperText('');
                      }}
                      value={newPublicAgeKey}
                      onChange={e => setNewPublicAgeKey(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="primary"
                      onClick={handleAddPublicAgeKey}
                      style={{
                        maxWidth: 200,
                      }}
                    >
                      {t('sopsConfigDialog.addPublicAgeKey')}
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Flex>
  );
}

export default ConfigEncryptionDialog;

function buildKeyFromSopsData(sopsData: SopsConfigDTO | undefined) {
  const gcpKms = sopsData?.gcp_kms?.[0];
  if (!gcpKms || !gcpKms.resource_id) {
    return undefined;
  }
  const resourceParts = gcpKms.resource_id.split('/');
  if (resourceParts.length === 8) {
    return {
      projectId: resourceParts[1],
      keyRing: resourceParts[5],
      name: resourceParts[7],
      locations: resourceParts[3],
      resourceId: gcpKms.resource_id,
      createdAt: gcpKms.created_at,
      userPermissions: [CryptoKeyPermission.UNKNOWN],
    };
  }

  return undefined;
}
