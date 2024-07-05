import React, { Fragment } from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from '@material-ui/core';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { consequenceOptions, probabilityOptions } from '../../utils/constants';
import { formatNOK } from '../../utils/utilityfunctions';
import { useEstimatedRiskInfoDialogStyles } from './estimatedRiskInfoDialogStyle';

export interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EstimatedRiskInfoDialog = ({
  isOpen,
  onClose,
}: EstimatedRiskInfoDialogProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { paper, title, text } = useEstimatedRiskInfoDialogStyles();

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs">
      <Paper className={paper}>
        <DialogTitle className={title}>{t('infoDialog.title')}</DialogTitle>
        <DialogContent className={text} dividers>
          <DialogContentText className={text}>
            {t('infoDialog.description')}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.calculatedHowTitle')}
          </Typography>
          <DialogContentText className={text}>
            {t('infoDialog.calculatedHow')}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.consequenceTitle')}
          </Typography>
          <DialogContentText className={text}>
            {consequenceOptions.map((option, index) => (
              <Fragment key={option}>
                {index + 1}: {formatNOK(option)}
                <br />
              </Fragment>
            ))}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.probabilityTitle')}
          </Typography>
          <DialogContentText className={text}>
            {probabilityOptions.map((option, index) => (
              <Fragment key={option}>
                {index + 1}: {option}, {/* @ts-ignore */}
                {t(`infoDialog.probabilityDescription.${index}`)}
                <br />
              </Fragment>
            ))}
          </DialogContentText>

          <DialogContentText className={text}>
            {t('infoDialog.example')}
          </DialogContentText>
        </DialogContent>
      </Paper>
    </Dialog>
  );
};
