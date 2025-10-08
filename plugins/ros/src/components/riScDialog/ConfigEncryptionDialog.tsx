import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  DialogContentText,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from '@mui/material';
import { GcpCryptoKeyMenu } from '../sopsConfigDialog/GcpCryptoKeyMenu';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { AddCircle, ExpandMore } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { GcpCryptoKeyObject, SopsConfigDTO } from '../../utils/DTOs';
import { useEffect, useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { RiScDialogStates } from './RiScDialog';
import { isPublicAgeKeyValid } from '../../utils/utilityfunctions';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
import FormHelperText from '@mui/material/FormHelperText';
import { URLS } from '../../urls';
import { Text, Link, Button, Flex, Box } from '@backstage/ui';
import { Divider } from '@mui/material';

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

  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] =
    useState<GcpCryptoKeyObject>(() => {
      if (state === RiScDialogStates.EditEncryption && sopsData?.gcp_kms) {
        const gcpKms = sopsData.gcp_kms[0];
        if (gcpKms?.resource_id) {
          const resourceParts = gcpKms.resource_id.split('/');
          if (resourceParts.length === 8) {
            return {
              projectId: resourceParts[1],
              keyRing: resourceParts[5],
              keyName: resourceParts[7],
              locations: resourceParts[3],
              resourceId: gcpKms.resource_id,
              createdAt: gcpKms.created_at,
              hasEncryptDecryptAccess: true,
            };
          }
        }
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
    <Flex direction="column" gap="16px">
      <Divider />
      <Text as="h2" variant="title-small" weight="bold">
        {t('rosDialog.stepEncryption')}
      </Text>
      <DialogContentText>
        {state === RiScDialogStates.Create
          ? t('sopsConfigDialog.description.new')
          : t('sopsConfigDialog.description.edit')}
      </DialogContentText>
      <Text variant="body-medium" weight="bold">
        {t('sopsConfigDialog.selectKeysTitle')}
      </Text>

      {chosenGcpCryptoKey !== undefined ? (
        <>
          {t('sopsConfigDialog.gcpCryptoKeyDescription')}
          <GcpCryptoKeyMenu
            chosenGcpCryptoKey={chosenGcpCryptoKey}
            onChange={handleChangeGcpCryptoKey}
            gcpCryptoKeys={
              gcpCryptoKeys.includes(chosenGcpCryptoKey)
                ? gcpCryptoKeys
                : [...gcpCryptoKeys, chosenGcpCryptoKey]
            }
          />
        </>
      ) : (
        <Text variant="body-medium">
          {t('sopsConfigDialog.gcpCryptoKeyNoSelectableKey')}
        </Text>
      )}
      {errors.sopsConfig !== undefined && (
        <FormHelperText error={true}>
          {t('sopsConfigDialog.gcpCryptoKeyNonSelectedErrorMessage')}
        </FormHelperText>
      )}
      <Box>
        <Accordion elevation={1} defaultExpanded={publicAgeKeys.length > 0}>
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
              <Text as="p" variant="body-large"></Text>
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
                    variant="tertiary"
                    onClick={showAddPublicAgeKey}
                    style={{
                      maxWidth: 150,
                      marginTop: '1rem',
                      color: '#1f5493',
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
