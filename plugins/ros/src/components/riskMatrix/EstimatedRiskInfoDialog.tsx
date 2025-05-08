import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from '@material-ui/core';
import { Fragment } from 'react';
import { consequenceOptions, probabilityOptions } from '../../utils/constants';
import { pluginRiScTranslationRef } from '../../utils/translations';
import {
  consequenceIndexToTranslationKeys,
  formatNOK,
  probabilityIndexToTranslationKeys,
} from '../../utils/utilityfunctions';
import { useEstimatedRiskInfoDialogStyles } from './estimatedRiskInfoDialogStyle';

interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EstimatedRiskInfoDialog({
  isOpen,
  onClose,
}: EstimatedRiskInfoDialogProps) {
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
            <sup>{t('infoDialog.calculatedHowExponent')}</sup>{' '}
            {t('riskMatrix.estimatedRisk.unit.nokPerYear')}.
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.consequenceTitle')}
          </Typography>
          <DialogContentText className={text}>
            {consequenceOptions.map((option, index) => (
              <Fragment key={index}>
                <b>{index + 1}</b>: 20<sup>{index + 3}</sup> ={' '}
                {formatNOK(option)} {t('infoDialog.consequenceUnit')} ={' '}
                <b>{t(consequenceIndexToTranslationKeys[index] as any, {})}</b>
                <br />
              </Fragment>
            ))}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.probabilityTitle')}
          </Typography>
          <DialogContentText className={text}>
            {probabilityOptions.map((option, index) => (
              <Fragment key={index}>
                <b>{index + 1}</b>: 20<sup>{index - 2}</sup> = {option}{' '}
                {t('infoDialog.probabilityUnit')} ={' '}
                <b>{t(probabilityIndexToTranslationKeys[index] as any, {})}</b>
                <br />
              </Fragment>
            ))}
          </DialogContentText>

          <DialogContentText className={text}>
            {t('infoDialog.example.part1')}
            <b>2</b> (20<sup>4</sup> = 160,000 {t('infoDialog.consequenceUnit')}
            ){t('infoDialog.example.part2')}
            <b>4</b> (20<sup>1</sup> = 20 {t('infoDialog.probabilityUnit')})
            {t('infoDialog.example.part3')}
            20<sup>1+4-1</sup> = 160,000{' '}
            {t('riskMatrix.estimatedRisk.unit.nokPerYear')}.
          </DialogContentText>
        </DialogContent>
      </Paper>
    </Dialog>
  );
}
