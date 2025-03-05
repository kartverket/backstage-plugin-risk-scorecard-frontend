import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  DialogContentText,
  FormLabel,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { GcpCryptoKeyMenu } from '../sopsConfigDialog/GcpCryptoKeyMenu';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { AddCircle, ExpandMore } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { GcpCryptoKeyObject, SopsConfigDTO } from '../../utils/DTOs';
import React, { useEffect, useState } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { RiScDialogStates } from './RiScDialog';
import { isPublicAgeKeyValid } from '../../utils/utilityfunctions';

interface ConfigEncryptionDialogProps {
  gcpCryptoKeys: GcpCryptoKeyObject[];
  sopsData?: SopsConfigDTO;
  setValue: UseFormSetValue<RiScWithMetadata>;
  register: UseFormRegister<RiScWithMetadata>;
  state: RiScDialogStates;
}

const ConfigEncryptionDialog = ({
  gcpCryptoKeys,
  sopsData,
  setValue,
  state,
}: ConfigEncryptionDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [publicAgeKeyHelperText, setPublicKeyTextFieldHelperText] =
    useState('');
  const [publicAgeKeyError, setPublicKeyTextFieldError] = useState(false);
  const [newPublicAgeKey, setNewPublicAgeKey] = useState('');
  const [publicAgeKeys, setPublicAgeKeys] = useState<string[]>(() => {
    if (sopsData?.key_groups) {
      return sopsData.key_groups
        .flatMap(group => group.age || [])
        .map(age => age.recipient)
        .filter(
          key =>
            key !==
            'age18e0t6ve0vdxqzzjt7rxf0r6vzc37fhs5cad2qz40r02c3spzgvvq8uxz23',
        )
        .filter(
          key =>
            key !==
            'age145s860ux96jvx6d7nwvzar588qjmgv5p47sp6nmmt2jnmhqh4scqcuk0mg',
        )
        .filter(
          key =>
            key !==
            'age1kjpgclkjev08aa8l2uy277gn0cngrkrkazt240405ezqywkm5axqt3d3tq',
        );
    }
    return [];
  });

  const [chosenGcpCryptoKey, setChosenGcpCryptoKey] =
    useState<GcpCryptoKeyObject>(() => {
      if (state === RiScDialogStates.EditEncryption && sopsData?.key_groups) {
        const gcpKms = sopsData.key_groups.find(keygroup => keygroup.gcp_kms)
          ?.gcp_kms?.[0];
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

  useEffect(() => {
    setValue('sopsConfig', {
      shamir_threshold: 2,
      key_groups: [
        {
          gcp_kms: [
            {
              resource_id: chosenGcpCryptoKey.resourceId,
              created_at: chosenGcpCryptoKey.createdAt,
            },
          ],
        },
        ...(publicAgeKeys.length > 0
          ? [
              {
                age: publicAgeKeys.map(key => ({
                  recipient: key,
                })),
              },
            ]
          : []),
      ],
    });
  }, [chosenGcpCryptoKey, publicAgeKeys, setValue]);

  const handleChangeGcpCryptoKey = (newKey: GcpCryptoKeyObject) => {
    setChosenGcpCryptoKey(newKey);
  };

  const handleAddPublicAgeKey = () => {
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
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DialogContentText>
        {state === RiScDialogStates.Create
          ? t('sopsConfigDialog.description.new')
          : t('sopsConfigDialog.description.edit')}
      </DialogContentText>
      {t('sopsConfigDialog.selectKeysTitle')}
      {t('sopsConfigDialog.gcpCryptoKeyDescription')}

      <GcpCryptoKeyMenu
        chosenGcpCryptoKey={chosenGcpCryptoKey}
        onChange={handleChangeGcpCryptoKey}
        gcpCryptoKeys={gcpCryptoKeys}
      />
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
              <Typography>
                {t('dictionary.click')}{' '}
                <Link
                    href="https://kartverket.atlassian.net/wiki/spaces/SIK/pages/1472528509/Skrive+koden+r+RoS+lokalt"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                >
                  {t('dictionary.here')}
                </Link>{' '}
                {t('sopsConfigDialog.writeLocalRiscSuffix')}
              </Typography>
              <Typography>
                {`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
                  'dictionary.optional',
                )})`}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'space-between',
                  gap: 2,
                }}
              >
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
                />
                <Button
                  startIcon={<AddCircle />}
                  variant="text"
                  color="primary"
                  onClick={handleAddPublicAgeKey}
                  sx={{
                    maxWidth: 200,
                    mt: 1,
                  }}
                >
                  {t('sopsConfigDialog.addPublicAgeKey')}
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ConfigEncryptionDialog;
