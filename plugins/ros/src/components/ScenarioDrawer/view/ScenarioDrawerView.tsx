import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import {
  Button,
  FormLabel,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import { useInputFieldStyles, useScenarioDrawerStyles } from '../style';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import { ScenarioContext } from '../../ROSPlugin/ScenarioContext';
import { TiltakView } from './TiltakView';

interface ScenarioDrawerViewProps {
  onClose: () => void;
  editScenario: () => void;
}

export const ScenarioDrawerView = ({
  onClose,
  editScenario,
}: ScenarioDrawerViewProps) => {
  const { formLabel } = useInputFieldStyles();
  const { header, content, iconButton, icon, buttons } =
    useScenarioDrawerStyles();

  const { scenario } = useContext(ScenarioContext)!!;

  return (
    <>
      <Box className={header}>
        <Typography variant="h4">Risikoscenario</Typography>
        <IconButton
          key="dismiss"
          title="Close the drawer"
          onClick={onClose}
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
              onClick={editScenario}
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

          <Grid item xs={12}>
            <FormLabel className={formLabel}>Beskrivelse</FormLabel>
            <Typography
              variant="body1"
              style={{
                fontSize: '1.1rem',
              }}
            >
              {scenario.beskrivelse}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <FormLabel className={formLabel}>Trusselaktører</FormLabel>
            {scenario.trusselaktører.map(trusselaktør => (
              <Typography
                variant="body1"
                style={{
                  fontSize: '1.1rem',
                }}
              >
                {trusselaktør}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6}>
            <FormLabel className={formLabel}>Sårbarheter</FormLabel>
            {scenario.sårbarheter.map(sårbarhet => (
              <Typography
                variant="body1"
                style={{
                  fontSize: '1.1rem',
                }}
              >
                {sårbarhet}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Tiltak
            </Typography>
            {scenario.tiltak.map((tiltak, index) => (
              <TiltakView tiltak={tiltak} index={index + 1} />
            ))}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
