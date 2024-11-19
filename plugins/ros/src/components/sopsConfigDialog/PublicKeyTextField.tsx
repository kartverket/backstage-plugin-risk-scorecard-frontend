import TextField from '@mui/material/TextField';
import React, {useState} from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { DeleteOutline } from '@material-ui/icons';
import { ControllerRenderProps } from 'react-hook-form';
import {SopsConfigDialogFormData} from "./SopsConfigDialog";

export interface PublicKeyTextFieldProp {
  onClick: (index: number) => void;
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  field: ControllerRenderProps<SopsConfigDialogFormData, `publicAgeKeys.${number}`>;
  minWidth: number;
}

export const PublicKeyTextField = ({ onClick, index, value, onChange, field, minWidth } : PublicKeyTextFieldProp) => {
    const {t} = useTranslationRef(pluginRiScTranslationRef)

    const [isError, setIsError] = useState(true)
    const validatePublicAgeKey = (key: string) => {
        console.log(key.length)
        if (key.length != 62) {
            console.log("Not desired length")
            setIsError(true);
            return;
        }

        if (!key.startsWith('age1')) {
            console.log("Does not start with age1")
            setIsError(true);
            return;
        }

        const ageKeyRegex = /^age1[ac-hj-np-z02-9]{58}$/;
        setIsError(!ageKeyRegex.test(key))
    }
    
    return (
        <Box
            sx={{display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between'}}
        >
            <TextField
                required={true}
                {...field}
                error={isError}
                value={value}
                label={t('sopsConfigDialog.publicAgeKey')}
                sx={{minWidth: minWidth}}
                onChange={(e) => {
                    validatePublicAgeKey(e.target.value);
                    onChange(index, e.target.value);
                }}
            />
            <IconButton
                onClick={() => onClick(index)}
            >
                <DeleteOutline/>
            </IconButton>
        </Box>
    );
}