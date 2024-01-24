import { MenuProps } from "@material-ui/core/Menu";
import { makeStyles, Theme } from "@material-ui/core";
import { Scenario } from "../interface/interfaces";

export const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8
    }
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center"
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center"
  },
  variant: "menu"
};

export const useDrawerStyles = makeStyles((theme: Theme) => ({
    paper: {
      width: "40%",
      padding: theme.spacing(8)
    }
  })
);

export const useDrawerContentStyles = makeStyles((theme: Theme) => ({
    header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    icon: {
      fontSize: 20
    },
    content: {
      display: "flex",
      flexDirection: "column",
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4)
    },
    buttons: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing(2)
    }
  })
);

export const useInputFieldStyles = makeStyles((theme: Theme) => ({
    inputBox: {
      paddingTop: theme.spacing(2)
    },
    formLabel: {
      marginBottom: theme.spacing(1)
    }
  })
);

export const tomtScenario = (): Scenario => ({
  ID: 0,
  beskrivelse: "",
  sistEndret: new Date().toISOString().split('T')[0],
  trusselaktører: [],
  sårbarheter: [],
  risiko: {
    oppsummering: "",
    sannsynlighet: 0,
    konsekvens: 0
  },
  tiltak: []
});