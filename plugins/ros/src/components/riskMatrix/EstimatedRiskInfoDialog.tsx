import { Fragment } from 'react';
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

interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsequenceDescription = ({
  option,
  index,
  t,
}: {
  option: number;
  index: number;
  t: any;
}) => (
  <Fragment key={option}>
    <b>{index + 1}</b>: 20<sup>{index + 3}</sup> = {formatNOK(option)}{' '}
    {t('infoDialog.consequenceDescriptionGeneral')} ={' '}
    <b
      dangerouslySetInnerHTML={{
        __html: t(`infoDialog.consequenceDescription.${index}`),
      }}
    />
    <br />
  </Fragment>
);

const ProbabilityDescription = ({
  option,
  index,
  t,
}: {
  option: number;
  index: number;
  t: any;
}) => (
  <Fragment key={option}>
    <b>{index + 1}</b>: 20<sup>{index - 2}</sup> = {option}{' '}
    {t('infoDialog.probabilityDescriptionGeneral')} ={' '}
    <b
      dangerouslySetInnerHTML={{
        __html: t(`infoDialog.probabilityDescription.${index}`),
      }}
    />
    <br />
  </Fragment>
);

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
          <DialogContentText
            className={text}
            dangerouslySetInnerHTML={{
              __html: t('infoDialog.calculatedHow'),
            }}
          />
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.consequenceTitle')}
          </Typography>
          <DialogContentText className={text}>
            {consequenceOptions.map((option, index) => (
              <ConsequenceDescription
                key={index}
                option={option}
                index={index}
                t={t}
              />
            ))}
          </DialogContentText>
          <Typography style={{ fontWeight: 'bold' }}>
            {t('infoDialog.probabilityTitle')}
          </Typography>
          <DialogContentText className={text}>
            {probabilityOptions.map((option, index) => (
              <ProbabilityDescription
                key={index}
                option={option}
                index={index}
                t={t}
              />
            ))}
          </DialogContentText>

          <DialogContentText
            className={text}
            dangerouslySetInnerHTML={{
              __html: t('infoDialog.example'),
            }}
          />
        </DialogContent>
      </Paper>
    </Dialog>
  );
}
