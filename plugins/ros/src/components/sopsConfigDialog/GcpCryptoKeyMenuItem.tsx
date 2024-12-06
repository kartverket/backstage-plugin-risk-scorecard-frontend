import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { VpnKey } from '@mui/icons-material';
import {GcpCryptoKeyObject} from "../../utils/DTOs";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import {Avatar} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";

interface GcpCryptoKeyMenuItemProps {
  value: string;
  gcpCryptoKey: GcpCryptoKeyObject;
  handleClick: (gcpCryptoKey: GcpCryptoKeyObject) => void;
}

export const GcpCryptoKeyMenuItem = ({
                                      value,
                                      gcpCryptoKey,
                                      handleClick,
                                  }: GcpCryptoKeyMenuItemProps) => {
    return (
        <MenuItem
            value={value}
            onClick={() => handleClick(JSON.parse(value) as GcpCryptoKeyObject)}
        >
            <ListItem
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <ListItemAvatar>
                    <Avatar>
                        <VpnKey />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={gcpCryptoKey.name} secondary={`Key ring: ${gcpCryptoKey.keyRing}, project ID: ${gcpCryptoKey.projectId}`} />
            </ListItem>
        </MenuItem>
    );
};
