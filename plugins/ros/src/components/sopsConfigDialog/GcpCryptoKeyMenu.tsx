import React from 'react';
import {Avatar, ListItemButton, Menu} from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import { GcpCryptoKeyMenuItem } from './GcpCryptoKeyMenuItem';
import Box from "@mui/material/Box";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import {VpnKey} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";

interface GcpCryptoKeyMenuProps {
  chosenGcpCryptoKey: GcpCryptoKeyObject;
  onChange: (gcpCryptoKey: GcpCryptoKeyObject) => void;
  gcpCryptoKeys: GcpCryptoKeyObject[];
}

export const GcpCryptoKeyMenu = ({
  chosenGcpCryptoKey,
  onChange,
  gcpCryptoKeys,
}: GcpCryptoKeyMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClickMenuItem = (gcpCryptoKey: GcpCryptoKeyObject) => {
    onChange(gcpCryptoKey);
    setAnchorEl(null);
  };

  return (
      <Box
        sx={{
            position: 'relative',
            left: 0
        }}
      >
          <ListItemButton
              onClick={handleClick}
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
              <ListItemText primary={chosenGcpCryptoKey.name} secondary={`Key ring: ${chosenGcpCryptoKey.keyRing}, project ID: ${chosenGcpCryptoKey.projectId}`} />
          </ListItemButton>
          <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        variant={'selectedMenu'}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {gcpCryptoKeys.map(gcpCryptoKey => (
          <GcpCryptoKeyMenuItem
            value={JSON.stringify(gcpCryptoKey)}
            gcpCryptoKey={gcpCryptoKey}
            handleClick={handleClickMenuItem}
          />
        ))}
      </Menu>
      </Box>
  );
};
