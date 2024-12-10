import React, { useEffect, useRef, useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import { isPublicAgeKeyValid } from '../../utils/utilityfunctions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AddCircle from '@mui/icons-material/AddCircle';
import { SopsConfig, SopsConfigDialogFormData } from '../../utils/types';
import { PublicKeyList } from './PublicKeyList';
import Box from '@mui/material/Box';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { UseFormSetValue } from 'react-hook-form';

interface AgeKeysComponentProps {
  chosenSopsConfig: SopsConfig;
  publicKeysToAdd: string[];
  setPublicKeysToAdd: React.Dispatch<React.SetStateAction<string[]>>;
  publicKeysToBeDeleted: string[];
  setPublicKeysToBeDeleted: React.Dispatch<React.SetStateAction<string[]>>;
  setValue: UseFormSetValue<SopsConfigDialogFormData>;
}

export const AgeKeysComponent = ({
  chosenSopsConfig,
  publicKeysToAdd,
  setPublicKeysToAdd,
  publicKeysToBeDeleted,
  setPublicKeysToBeDeleted,
  setValue,
}: AgeKeysComponentProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const publicKeysToAddRef = useRef(publicKeysToAdd);

  const publicKeysToBeDeletedRef = useRef(publicKeysToBeDeleted);

  const [publicKeyTextFieldHelperText, setPublicKeyTextFieldHelperText] =
    useState('');

  const [currentPublicKey, setCurrentPublicKey] = useState('');
  const [publicKeyTextFieldError, setPublicKeyTextFieldError] = useState(false);

  const handleDeletePublicKeyAlreadyPresent = (key: string) => {
    if (publicKeysToBeDeleted.includes(key)) {
      publicKeysToBeDeletedRef.current = publicKeysToBeDeleted.filter(
        k => k !== key,
      );
      setPublicKeysToBeDeleted(publicKeysToBeDeletedRef.current);
      setValue('publicAgeKeysToDelete', publicKeysToBeDeletedRef.current);
    } else {
      publicKeysToBeDeletedRef.current = [...publicKeysToBeDeleted, key];
      setPublicKeysToBeDeleted(publicKeysToBeDeletedRef.current);
      setValue('publicAgeKeysToDelete', publicKeysToBeDeletedRef.current);
    }
  };

  const handleClickAddKeyButton = () => {
    if (chosenSopsConfig.publicAgeKeys.includes(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExistInSopsConfig'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    if (publicKeysToAdd.includes(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyAlreadyExists'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    if (!isPublicAgeKeyValid(currentPublicKey)) {
      setPublicKeyTextFieldHelperText(
        t('sopsConfigDialog.publicKeyHelperTextKeyNotValid'),
      );
      setPublicKeyTextFieldError(true);
      return;
    }
    publicKeysToAddRef.current = [...publicKeysToAdd, currentPublicKey];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setCurrentPublicKey('');
  };

  const handleDeletePublicKeyListItem = (key: string) => {
    publicKeysToAddRef.current = publicKeysToAdd.filter(
      element => element !== key,
    );
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
  };

  useEffect(() => {
    publicKeysToAddRef.current = [];
    setPublicKeysToAdd(publicKeysToAddRef.current);
    setValue('publicAgeKeysToAdd', publicKeysToAddRef.current);
    setValue('gcpProjectId', chosenSopsConfig.gcpProjectId);
  }, [chosenSopsConfig, setPublicKeysToAdd, setValue]);

  return (
    <Box>
      <Accordion elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          {t('sopsConfigDialog.publicAgeKeyQuestion')}
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {chosenSopsConfig.publicAgeKeys.length !== 0 && (
              <FormLabel>
                {t('sopsConfigDialog.publicAgeKeysAlreadyPresent')}
              </FormLabel>
            )}
            <PublicKeyList
              publicKeys={chosenSopsConfig.publicAgeKeys}
              onClickButton={handleDeletePublicKeyAlreadyPresent}
              deletedKeys={publicKeysToBeDeleted}
            />

            {`${t('sopsConfigDialog.publicAgeKeyDescription')} (${t(
              'dictionary.optional',
            )})`}

            <PublicKeyList
              publicKeys={publicKeysToAdd}
              onClickButton={handleDeletePublicKeyListItem}
              deletedKeys={publicKeysToBeDeleted}
            />

            <TextField
              label={t('sopsConfigDialog.publicAgeKey')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleClickAddKeyButton();
                }
              }}
              sx={{ minWidth: 700 }}
              error={publicKeyTextFieldError}
              onFocus={() => {
                setPublicKeyTextFieldError(false);
                setPublicKeyTextFieldHelperText('');
              }}
              value={currentPublicKey}
              helperText={publicKeyTextFieldHelperText}
              onChange={e => setCurrentPublicKey(e.target.value)}
            />

            <Button
              startIcon={<AddCircle />}
              variant="text"
              color="primary"
              onClick={handleClickAddKeyButton}
              sx={{
                maxWidth: 200,
                mt: 1,
              }}
            >
              {t('sopsConfigDialog.addPublicAgeKey')}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
