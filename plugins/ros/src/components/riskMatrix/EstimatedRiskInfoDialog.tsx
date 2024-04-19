import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { pluginRiScTranslationRef } from '../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { konsekvensOptions, sannsynlighetOptions } from '../utils/constants';
import { formatNOK } from '../utils/utilityfunctions';

export interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const useStyles = makeStyles({
  paper: {
    backgroundColor: 'white',
  },
  title: {
    borderBottom: '1px solid black',
    color: 'black',
  },
  text: {
    color: 'black',
  },
});

export const EstimatedRiskInfoDialog = ({
  isOpen,
  onClose,
}: EstimatedRiskInfoDialogProps) => {
  const classes = useStyles();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs">
      <Paper className={classes.paper}>
        <DialogTitle className={classes.title}>
          {t('infoDialog.title')}
        </DialogTitle>
        <DialogContent className={classes.text} dividers>
          <DialogContentText className={classes.text}>
            {t('infoDialog.description')}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.calculatedHowTitle')}
          </Typography>
          <DialogContentText className={classes.text}>
            {t('infoDialog.calculatedHow')}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.consequenceTitle')}
          </Typography>
          <DialogContentText className={classes.text}>
            {konsekvensOptions.map((option, index) => (
              <>
                {index + 1}: {formatNOK(option)}
                <br />
              </>
            ))}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.probabilityTitle')}
          </Typography>
          <DialogContentText className={classes.text}>
            {sannsynlighetOptions.map((option, index) => (
              <>
                {index + 1}: {option}, {/* @ts-ignore */}
                {t(`infoDialog.probabilityDescription.${index}`)}
                <br />
              </>
            ))}
          </DialogContentText>

          <DialogContentText className={classes.text}>
            {t('infoDialog.example')}
          </DialogContentText>
        </DialogContent>
      </Paper>
    </Dialog>
  );
};
