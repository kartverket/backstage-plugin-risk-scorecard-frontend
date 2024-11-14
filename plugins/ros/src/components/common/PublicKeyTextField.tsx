import TextField from '@mui/material/TextField';
import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { DeleteOutline } from '@material-ui/icons';

export interface PublicKeyTextFieldProp {
  onClick: () => void;
  minWidth: number;
}

export const PublicKeyTextField = ({ onClick, minWidth } : PublicKeyTextFieldProp) => {
    const {t} = useTranslationRef(pluginRiScTranslationRef)
    return (
        <Box
            sx={{display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between'}}
        >
            <TextField
                label={t('sopsConfigDialog.publicAgeKey')}
                sx={{minWidth: minWidth}}
            />
            <IconButton
                onClick={onClick}
            >
                <DeleteOutline/>
            </IconButton>
        </Box>
    );
}