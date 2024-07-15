import React from 'react';
import Box from '@mui/material/Box';
import { Grid, Paper, Typography } from '@material-ui/core';
import {
  formatNOK,
  getConsequenceLevel,
  getRiskMatrixColor,
  getProbabilityLevel,
} from '../../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useScenario } from '../../../ScenarioContext';
import { useFontStyles } from '../../../utils/style';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { Risk } from '../../../utils/types';

interface RiskProps {
  risk: Risk;
  riskType: 'initialRisk' | 'restRisk';
  editScenario: (step: 'initialRisk' | 'restRisk') => void;
}

const RiskBox = ({ risk, riskType }: RiskProps) => {
  const { risikoBadge, section } = useScenarioDrawerStyles();
  const { h3, body1, label } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Paper className={section} style={{ padding: '1rem' }}>
      <Grid item xs={12} style={{ marginBottom: '0.5rem' }}>
        <Typography className={h3}>{t(`dictionary.${riskType}`)}</Typography>
      </Grid>

      <Grid container>
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <Box
            className={risikoBadge}
            style={{
              backgroundColor: getRiskMatrixColor(risk),
            }}
          />
          <Grid
            item
            xs={12}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: '4px',
            }}
          >
            <Typography className={label} style={{ paddingBottom: 0 }}>
              {t('dictionary.probability')}: {getProbabilityLevel(risk)}
            </Typography>
            <Typography className={label} style={{ paddingBottom: 0 }}>
              {t('dictionary.consequence')}: {getConsequenceLevel(risk)}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className={label}>
            {t('dictionary.estimatedRisk')}
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ paddingTop: 0 }}>
          <Typography className={body1}>
            {formatNOK(risk.consequence * risk.probability)}{' '}
            {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export const RiskSection = () => {
  const { scenario, editScenario } = useScenario();

  return (
    <>
      {/* Initial risk -> Rest risk*/}
      <Grid
        container
        wrap="nowrap"
        alignItems="center"
        spacing={0}
        style={{ gap: '8px' }}
      >
        {/* Initial risk */}
        <RiskBox
          risk={scenario.risk}
          riskType="initialRisk"
          editScenario={editScenario}
        />

        {/* Arrow */}
        <Grid item style={{}}>
          <KeyboardDoubleArrowRightIcon style={{ fontSize: '48px' }} />
        </Grid>

        {/* Rest risk */}
        <RiskBox
          risk={scenario.remainingRisk}
          riskType="restRisk"
          editScenario={editScenario}
        />
      </Grid>
    </>
  );
};
