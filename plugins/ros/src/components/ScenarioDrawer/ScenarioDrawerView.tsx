import React from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { useScenarioDrawerStyles } from './style';
import { Scenario } from '../utils/types';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';

interface ROSDrawerContentProps {
  toggleDrawer: (isOpen: boolean) => void;
  scenario: Scenario;
  deleteScenario: () => void;
  editScenario: () => void;
}

export const ScenarioDrawerView = ({
  toggleDrawer,
  scenario,
  editScenario,
  deleteScenario,
}: ROSDrawerContentProps) => {
  const { header, content, iconButton, icon, buttons } =
    useScenarioDrawerStyles();

  return (
    <>
      <Box className={header}>
        <Typography variant="h4">Risikoscenario</Typography>
        <IconButton
          key="dismiss"
          title="Close the drawer"
          onClick={() => toggleDrawer(false)}
          color="inherit"
          className={iconButton}
        >
          <KeyboardTabIcon className={icon} />
        </IconButton>
      </Box>

      <Box className={content}>
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              style={{
                fontSize: '1.2rem',
                marginBottom: '1rem',
              }}
            >
              {scenario.tittel}
            </Typography>
          </Grid>

          <Grid item className={buttons}>
            <Button
              style={{ textTransform: 'none' }}
              variant="contained"
              color="primary"
              onClick={() => {}}
              startIcon={<BorderColorOutlinedIcon />}
            >
              Rediger
            </Button>

            <Button
              style={{ textTransform: 'none' }}
              variant="outlined"
              color="primary"
              onClick={() => {}}
              startIcon={<DeleteIcon />}
            >
              Slett
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
