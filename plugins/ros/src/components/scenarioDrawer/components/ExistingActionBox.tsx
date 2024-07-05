import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useScenarioDrawerStyles } from '../scenarioDrawerStyle';
import { useActionBoxStyles } from './actionBoxStyle';
import { useFontStyles } from '../../../utils/style';

interface ExistingActionBoxProps {
  existingAction: string;
}

export const ExistingActionBox = ({
  existingAction,
}: ExistingActionBoxProps) => {
  const { body2 } = useFontStyles();
  const { gridContainer } = useScenarioDrawerStyles();
  const { alignCenter } = useActionBoxStyles();

  return (
    <Grid container className={gridContainer}>
      <Grid item xs={12} className={alignCenter}>
        <Typography className={body2}>{existingAction}</Typography>
      </Grid>
    </Grid>
  );
};
