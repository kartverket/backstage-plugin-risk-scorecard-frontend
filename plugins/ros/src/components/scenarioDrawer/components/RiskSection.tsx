import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import {
  formatNOK,
  getConsequenceLevel,
  getRiskMatrixColor,
  getProbabilityLevel,
} from '../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import EditIcon from '@mui/icons-material/Edit';
import { useFontStyles } from '../../utils/style';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { Risk } from '../../utils/types';

export const RiskSection = () => {
  const { scenario, editScenario } = useContext(ScenarioContext)!!;

  return (
    <>
      {/* Initial risk -> Rest risk*/}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* Initial risk */}
        <RiskBox
          risk={scenario.risk}
          riskType="initialRisk"
          editScenario={editScenario}
        />

        {/* Arrow */}
        <Grid
          item
          xs={2}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <KeyboardDoubleArrowRightIcon fontSize="large" />
        </Grid>

        {/* Rest risk */}
        <RiskBox
          risk={scenario.risk}
          riskType="initialRisk"
          editScenario={editScenario}
        />
      </Box>
    </>
  );
};

interface RiskProps {
  risk: Risk;
  riskType: 'initialRisk' | 'restRisk';
  editScenario: (step: 'initialRisk' | 'restRisk') => void;
}

const RiskBox = ({ risk, riskType, editScenario }: RiskProps) => {
  const { risikoBadge, titleAndButton, section, editIcon } =
    useScenarioDrawerStyles();
  const { h3, body1, label, button } = useFontStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Paper className={section} style={{ padding: '1rem' }}>
      <Grid item xs={12} className={titleAndButton}>
        <Typography className={h3}>{t(`dictionary.${riskType}`)}</Typography>
        <Button
          className={button}
          variant="text"
          color="primary"
          onClick={() => editScenario(riskType)}
          startIcon={<EditIcon className={editIcon} aria-label="Edit" />}
        />
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
            }}
          >
            <Typography className={label}>
              {t('dictionary.probability')}: {getProbabilityLevel(risk)}
            </Typography>
            <Typography className={label}>
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
