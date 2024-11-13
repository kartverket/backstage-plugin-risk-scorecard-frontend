import Dialog from "@mui/material/Dialog";
import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import {useTranslationRef} from "@backstage/core-plugin-api/alpha";
import {pluginRiScTranslationRef} from "../../utils/translations";

export const NewSopsConfigDialog = () => {
    const { t } = useTranslationRef(pluginRiScTranslationRef);

    return (
        <Dialog open={true}>
            <DialogTitle>{t('newSopsConfigDialog.title')}</DialogTitle>

        </Dialog>
    );
}