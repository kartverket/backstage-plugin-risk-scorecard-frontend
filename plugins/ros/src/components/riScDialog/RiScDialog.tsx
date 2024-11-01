import React, { useState } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import { Tab } from '@material-ui/core';
import { CreateNewFromScratchTabPanel } from './CreateNewFromScratchTabPanel';
import { GenerateInitialTabPanel } from './GenerateInitialTabPanel';

export enum ChosenRisCDialog {
  FromScratc,
  GenerateInitial,
}

export enum RiScDialogStates {
  Closed,
  Edit,
  Create,
}

export interface RiScDialogProps {
  onCloseFromScratch: () => void;
  onCloseGenerateInitial: () => void;
  dialogState: RiScDialogStates;
}

export const RiScDialog = ({
  onCloseFromScratch,
  onCloseGenerateInitial,
  dialogState,
}: RiScDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const titleTranslation =
    dialogState === RiScDialogStates.Create
      ? t('rosDialog.titleNew')
      : t('rosDialog.titleEdit');

  const [chosenRisCDialog, setChosenRisCDialog] = useState(
    ChosenRisCDialog.FromScratc,
  );

  const handleChange = () => {
    switch (chosenRisCDialog) {
      case ChosenRisCDialog.FromScratc: {
        setChosenRisCDialog(ChosenRisCDialog.GenerateInitial);
        return;
      }
      case ChosenRisCDialog.GenerateInitial: {
        setChosenRisCDialog(ChosenRisCDialog.FromScratc);
        return;
      }
    }
  };

  return (
    <Dialog
      open={dialogState !== RiScDialogStates.Closed}
      onClose={onCloseFromScratch}
      maxWidth={'sm'}
      fullWidth={true}
    >
      <DialogTitle>{titleTranslation}</DialogTitle>
      {/*<Button variant="outlined" onClick={onClose}>*/}
      {/*  <ClearIcon/>*/}
      {/*</Button>*/}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={chosenRisCDialog}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label={t('rosDialog.nyFraScratch')} />
          <Tab label={t('rosDialog.nyFraAutogenerert')} />
        </Tabs>
      </Box>
      {chosenRisCDialog === ChosenRisCDialog.FromScratc && (
        <CreateNewFromScratchTabPanel
          onCloseFromScratch={onCloseFromScratch}
          dialogState={dialogState}
        />
      )}
      {chosenRisCDialog === ChosenRisCDialog.GenerateInitial && (
        <GenerateInitialTabPanel onClose={onCloseGenerateInitial} />
      )}
    </Dialog>
  );
};
