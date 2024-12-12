import React from 'react';
import { Avatar, ListItemButton, ListSubheader, Menu } from '@mui/material';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import { GcpCryptoKeyMenuItem } from './GcpCryptoKeyMenuItem';
import Box from '@mui/material/Box';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { VpnKey } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClickMenuItem = (gcpCryptoKey: GcpCryptoKeyObject) => {
    onChange(gcpCryptoKey);
    setAnchorEl(null);
  };

  const gcpCryptoKeysGroupedByAccess = gcpCryptoKeys.reduce<
    Record<string, GcpCryptoKeyObject[]>
  >((acc, gcpCryptoKey) => {
    const key = gcpCryptoKey.hasEncryptDecryptAccess.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(gcpCryptoKey);
    return acc;
  }, {});

  return (
    <Box
      sx={{
        position: 'relative',
        left: 0,
        marginTop: 1,
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
        {chosenGcpCryptoKey.projectId === '' ? (
          <>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t('sopsConfigDialog.chooseGcpCryptoKey')} />
          </>
        ) : (
          <>
            <ListItemAvatar>
              <Avatar>
                <VpnKey />
              </Avatar>
            </ListItemAvatar>

              <ListItemText
                primary={chosenGcpCryptoKey.name}
                secondary={
                  <>
                    Project ID: {chosenGcpCryptoKey.projectId}
                    <br />
                    Key ring: {chosenGcpCryptoKey.keyRing}
                  </>
                }
              />
            {!chosenGcpCryptoKey.hasEncryptDecryptAccess &&
              < >
                <WarningAmberIcon sx={{ color: 'red' }}/>
                {t('dictionary.noAccess')}
              </>
            }
          </>
        )}
      </ListItemButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{
          paper: {
            style: {
              maxHeight: 500,
              width: 500,
            },
          },
        }}
      >
        {Object.keys(gcpCryptoKeysGroupedByAccess).map(hasAccess => (
          <li>
            <ul style={{ paddingLeft: 0, marginLeft: 0 }}>
              <ListSubheader>
                {hasAccess === 'true'
                  ? t('sopsConfigDialog.gcpKeyHaveAccess')
                  : t('sopsConfigDialog.gcpKeyDoNotHaveAccess')}
              </ListSubheader>
              {gcpCryptoKeysGroupedByAccess[hasAccess].map(gcpCryptoKey => (
                <GcpCryptoKeyMenuItem
                  value={JSON.stringify(gcpCryptoKey)}
                  gcpCryptoKey={gcpCryptoKey}
                  handleClick={handleClickMenuItem}
                  hasAccess={hasAccess === 'true'}
                />
              ))}
            </ul>
          </li>
        ))}
      </Menu>
    </Box>
  );
};
