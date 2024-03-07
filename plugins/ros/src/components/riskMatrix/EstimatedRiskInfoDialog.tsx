import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Paper,
  makeStyles,
} from '@material-ui/core';

export interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const useStyles = makeStyles({
  paper: {
    backgroundColor: 'white',
  },
  title: {
    borderBottom: '1px solid black',
    color: 'black',
  },
  text: {
    color: 'black',
  },
});

export const EstimatedRiskInfoDialog = ({
  isOpen,
  onClose,
}: EstimatedRiskInfoDialogProps) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs">
      <Paper className={classes.paper}>
        <DialogTitle className={classes.title}>Estimert risiko</DialogTitle>
        <DialogContent className={classes.text}>
          <DialogContentText className={classes.text}>
            Den estimerte risikoen er basert på hvor stor risiko de forskjellige
            scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig
            konsekvens skjer er det høy risiko for at det kan bli en stor
            kostnad for Kartverket. Kostnaden er m.a.o. et forsøk på å
            konkretisere verdien av risiko og er summen av den estimerte
            risikoen for alle risikoscenariene i denne ROS-analysen.
          </DialogContentText>
          <b>Hvordan regner vi ut estimert risiko?</b>
          <DialogContentText className={classes.text}>
            Konsekvensen måles i kroner per hendelse og sannsynlighet måles i
            hendelser per år. Den estimerte risikoen blir da: K x S.
          </DialogContentText>
          <b>Konsekvens (kr/hendelse)</b>
          <DialogContentText className={classes.text}>
            1: 1000 <br />
            2: 30 000 <br />
            3: 1 000 000 <br />
            4: 30 000 000 <br />
            5: 1 000 000 000
          </DialogContentText>
          <b>Sannsynlighet (hendelser/år)</b>
          <DialogContentText className={classes.text}>
            1: 0.001, ca hvert 100. år <br />
            2: 0.1, ca hvert 10. år <br />
            3: 1, ca årlig <br />
            4: 50, ca ukentlig <br />
            5: 300, ca daglig
          </DialogContentText>

          <DialogContentText className={classes.text}>
            Et risikoscenarie med konsekvens 2 og sannsynlighet 4 har en
            estimert risiko på 30 000 kr/hendelse x 50 hendelser/år = 1 500 000
            kr/år.
          </DialogContentText>
        </DialogContent>
      </Paper>
    </Dialog>
  );
};
