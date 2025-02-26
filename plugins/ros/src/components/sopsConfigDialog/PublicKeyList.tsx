import List from '@mui/material/List';
import React from 'react';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { VpnKey } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { Tooltip } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

interface PublicKeyListProps {
  publicKeys: string[];
  onClickButton: (key: string) => void;
  deletedKeys: string[];
}

export const PublicKeyList = ({
  publicKeys,
  onClickButton,
  deletedKeys,
}: PublicKeyListProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <List>
      {publicKeys.map((key, index) => (
        <Box>
          <ListItem
            disablePadding
            dense={true}
            secondaryAction={
              deletedKeys.includes(key) ? (
                <Tooltip title={t('dictionary.add')}>
                  <IconButton onClick={() => onClickButton(key)}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t('dictionary.delete')}>
                  <IconButton onClick={() => onClickButton(key)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <ListItemButton
              role={undefined}
              dense
              onClick={() => {
                navigator.clipboard.writeText(key);
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <VpnKey />
                </Avatar>
              </ListItemAvatar>
              {deletedKeys.includes(key) ? (
                <ListItemText
                  sx={{ textDecoration: 'line-through', opacity: 0.5 }}
                  primary={`${key.substring(0, 8)}...${key.slice(-4)}`}
                />
              ) : (
                <ListItemText
                  primary={`${key.substring(0, 8)}...${key.slice(-4)}`}
                />
              )}
            </ListItemButton>
          </ListItem>
          {publicKeys.length > 1 && index !== publicKeys.length - 1 && (
            <Divider component="li" sx={{ marginTop: 1, marginBottom: 1 }} />
          )}
        </Box>
      ))}
    </List>
  );
};
