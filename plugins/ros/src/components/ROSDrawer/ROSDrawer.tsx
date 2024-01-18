import React from "react";
import { createStyles, Drawer, makeStyles, Theme } from "@material-ui/core";
import { DrawerContent } from "./ROSDrawerContent";

interface ROSInputProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ROSDrawer = ({ isOpen, setIsOpen }: ROSInputProps) => {

  const classes = useDrawerStyles();

  return (
    <Drawer
      classes={{
        paper: classes.paper
      }}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <DrawerContent toggleDrawer={setIsOpen} />
    </Drawer>
  );
}

const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: "50%",
      justifyContent: "space-between",
      padding: theme.spacing(8)
    }
  })
);