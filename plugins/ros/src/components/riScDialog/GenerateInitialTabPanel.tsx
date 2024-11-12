import React, { useEffect, useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useAuthenticatedFetch } from '../../utils/hooks';
import { gcpProjectIdToReadableString } from '../../utils/utilityfunctions';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../common/mixins';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import { GenerateInitialRiScBody } from '../../utils/types';
import { useForm } from 'react-hook-form';
import { useRiScs } from '../../contexts/RiScContext';
import { Input } from '../common/Input';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';

interface GenerateInitialTabPanelProps {
  onClose: () => void;
}

export const GenerateInitialTabPanel = ({
  onClose,
}: GenerateInitialTabPanelProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { fetchAssociatedGcpProjects } = useAuthenticatedFetch();
  const { generateInitialRiSc, selectedRiSc } = useRiScs();
  const [associatedGcpProjects, setAssociatedGcpProjects] = useState<string[]>(
    [],
  );
  const [chosenGcpProjectId, setChosenGcpProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateInitialRiScBody>({
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((data: GenerateInitialRiScBody) => {
    generateInitialRiSc(selectedRiSc, data);
    onClose();
  });

  const handleChangeGcpProject = (event: SelectChangeEvent) => {
    setChosenGcpProjectId(event.target.value as string);
  };

  useEffect(() => {
    fetchAssociatedGcpProjects()
      .then(res => {
        setAssociatedGcpProjects(res);
        setChosenGcpProjectId(res[0]);
        setIsLoading(false);
      })
      .catch(err => {
        throw err;
      });
  }, []);

  return (
    <DialogContent
      sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <FormLabel>{t('rosDialog.gcpProject')}</FormLabel>
      <FormHelperText>{t('rosDialog.gcpProjectDescription')}</FormHelperText>
      {isLoading && (
        <LinearProgress
          sx={{
            position: 'sticky',
            top: 0,
            margin: 2,
          }}
        />
      )}
      {!isLoading && (
        <Select
          value={chosenGcpProjectId}
          required
          {...register('gcpProjectId', {
            required: true,
            onChange: handleChangeGcpProject,
          })}
          error={errors.gcpProjectId !== undefined}
        >
          {associatedGcpProjects.map((item, _) => (
            <MenuItem value={item}>
              {gcpProjectIdToReadableString(item)}
            </MenuItem>
          ))}
        </Select>
      )}
      <Input
        {...register('publicAgeKey', { required: false })}
        label={t('rosDialog.publicAgeKey')}
        sublabel={t('rosDialog.publicAgeKeyDescription')}
        error={errors.publicAgeKey !== undefined}
        minRows={2}
      />
      <DialogActions sx={dialogActions}>
        <Button variant="contained" onClick={onSubmit}>
          {t('rosDialog.lagNyFraAutogenerert')}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};
