import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import { ConsequenceTable } from "../scenarioWizard/components/ConsequenceTable";

export const MatrixDialog = ({open}: {open: boolean}) => {
    return (
        <Dialog open={open}>
            <DialogTitle>Risikomatriser</DialogTitle>
            <DialogContent>
                <ConsequenceTable selectedValue={1} handleChange={(n) => {}} isOnlyInfo={true} />
            </DialogContent>
        </Dialog>
    )
}