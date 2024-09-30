import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React from "react";
import {useGoogleTokenRefresh} from "../../contexts/AuthContext";

export const GoogleAuthAccessTokenDialog = () => {
    const { showAuthPrompt, refreshGoogleAuthAccessToken, refreshingGoogleAuthAccessToken, ignoreRefreshWarningForGoogleAuthAccessToken } = useGoogleTokenRefresh();

    return (<Dialog open={showAuthPrompt}>
        <DialogTitle>Sesjonen din er i ferd med å utløpe</DialogTitle>
        <DialogContent />
        <DialogActions>
            {<Button variant="contained" disabled={refreshingGoogleAuthAccessToken} onClick={() => {refreshGoogleAuthAccessToken()}}>Hold meg pålogget</Button>}
            <Button variant="outlined" onClick={() => ignoreRefreshWarningForGoogleAuthAccessToken()}>Ignorer</Button>
        </DialogActions>
    </Dialog>)
}