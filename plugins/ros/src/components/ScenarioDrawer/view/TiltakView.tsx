import React from 'react';
import { Tiltak as ITiltak } from '../../utils/types';
import { Grid, Paper, Typography } from '@material-ui/core';
import { useInputFieldStyles } from '../style';
import { useTiltakViewStyles } from './style';
import { formatDate } from '../../utils/utilityfunctions';
import Chip from '@material-ui/core/Chip';

interface TiltakProps {
  tiltak: ITiltak;
  index: number;
}

export const TiltakView = ({ tiltak, index }: TiltakProps) => {
  const classes = useInputFieldStyles();
  const { alignCenter, justifyEnd } = useTiltakViewStyles();

  const statusColor = () => {
    switch (tiltak.status) {
      case 'Ikke startet':
        return '#D9D9D9';
      case 'Startet':
        return '#FFF6AB';
      case 'På vent':
        return '#FFF6AB';
      case 'Fullført':
        return '#81C2A4';
      case 'Avbrutt':
        return '#FF0000';
      default:
        return '#000000';
    }
  };

  return (
    <Paper className={classes.paper} style={{ padding: '1rem' }}>
      <Grid container>
        <Grid item xs={12} className={alignCenter}>
          <Grid item xs={8}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Tiltak {index}
            </Typography>
          </Grid>

          <Grid item xs={4} className={alignCenter}>
            <Grid item xs={8} className={justifyEnd}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                Frist: {formatDate(tiltak.frist)}
              </Typography>
            </Grid>
            <Grid item xs={4} className={justifyEnd}>
              <Chip
                label={tiltak.status}
                style={{
                  margin: 0,
                  backgroundColor: statusColor(),
                  color: '#000000',
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1">{tiltak.beskrivelse}</Typography>
        </Grid>

        <Grid item xs={8}>
          <Typography variant="body1">
            Tiltakseier: {tiltak.tiltakseier}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
