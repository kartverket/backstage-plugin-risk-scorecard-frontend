import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { gcpProjectIdToReadableString } from '../../utils/utilityfunctions';
import { useAuthenticatedFetch } from '../../utils/hooks';
import DialogContent from "@mui/material/DialogContent";
import {dialogActions} from "../common/mixins";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";

export const NewSopsConfigDialog = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { fetchAssociatedGcpProjects } = useAuthenticatedFetch();

  const [associatedGcpProjects, setAssociatedGcpProjects] = useState<string[]>(
    [],
  );
  const [chosenGcpProject, setChosenGcpProject] = useState<string>('');

  const handleChangeGcpProject = (item: string) => {
    setChosenGcpProject(item);
  };

  useEffect(() => {
    fetchAssociatedGcpProjects()
      .then(res => {
        setAssociatedGcpProjects(res);
        setChosenGcpProject(res[0]);
      })
      .catch(err => {
        throw err;
      });
  }, []);

  return (
    <Dialog open={true}>
      <DialogTitle>{t('newSopsConfigDialog.title')}</DialogTitle>
        <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
              <FormLabel>{t('newSopsConfigDialog.description')}</FormLabel>
              <Select value={chosenGcpProject} required>
                {associatedGcpProjects.map((item, _) => (
                  <MenuItem value={item}>{gcpProjectIdToReadableString(item)}</MenuItem>
                ))}
              </Select>
        </DialogContent>

        <DialogActions sx={dialogActions}>
            <Button variant="outlined" >
                {t('dictionary.cancel')}
            </Button>
            <Button variant="contained" >
                {t('dictionary.save')}
            </Button>
        </DialogActions>
    </Dialog>
  );
};