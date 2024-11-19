import List from '@mui/material/List';
import React from 'react';
import ListItem from '@mui/material/ListItem';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar } from '@mui/material';
import ListItemText from "@mui/material/ListItemText";
import {VpnKey} from "@mui/icons-material";

interface PublicKeyListProps {
  publicKeys: string[];
}

export const PublicKeyList = ({ publicKeys }: PublicKeyListProps) => {
  return (
    <List dense={true}>
      {publicKeys.map(key => (
        <ListItem
          secondaryAction={
            <IconButton>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar>
              <VpnKey />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${key.substring(0, 8)}`}
          />
        </ListItem>
      ))}
    </List>
  );
};
