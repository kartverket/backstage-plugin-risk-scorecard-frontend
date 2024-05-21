import React, { useEffect, useState } from 'react';
import { Action as ITiltak } from '../../utils/types';
import { Grid, Typography } from '@material-ui/core';
import { useFontStyles, useScenarioDrawerContentStyles } from '../style';
import { useTiltakViewStyles } from './style';
import { formatDate } from '../../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

import { ChipDropdown } from '../../utils/ChipDropdown';
import { actionStatusOptions } from '../../utils/constants';

interface TiltakProps {
  tiltak: ITiltak;
  index: number;
  updateTiltak: (tiltak: ITiltak) => void;
  saveScenario: () => void;
}

export const TiltakView = ({
  tiltak,
  index,
  updateTiltak,
  saveScenario,
}: TiltakProps) => {
  const { measure } = useScenarioDrawerContentStyles();
  const { alignCenter, justifyEnd } = useTiltakViewStyles();
  const { body2, label } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [previousTiltak, setPreviousTiltak] = useState(tiltak);

  useEffect(() => {
    if (previousTiltak !== tiltak) {
      saveScenario();
      setPreviousTiltak(tiltak);
    }
  }, [tiltak, saveScenario, previousTiltak]);

  const setStatus = (status: string) => {
    updateTiltak({
      ...tiltak,
      status: status,
    });
  };

  return (
    <Grid container className={measure}>
      <Grid item xs={12} className={alignCenter}>
        <Grid item xs={6}>
          <Typography className={label}>
            {t('dictionary.measure')} {index}
          </Typography>
        </Grid>

        <Grid item xs={6} className={justifyEnd}>
          <ChipDropdown
            options={actionStatusOptions}
            selectedValue={tiltak.status}
            handleChange={setStatus}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography className={body2}>{tiltak.description}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>
          {t('dictionary.measureOwner')}
        </Typography>
        <Typography className={body2}>{tiltak.owner}</Typography>
      </Grid>

      <Grid item xs={4}>
        <Typography className={label}>{t('dictionary.deadline')}</Typography>
        <Typography className={body2}>{formatDate(tiltak.deadline)}</Typography>
      </Grid>
    </Grid>
  );
};
