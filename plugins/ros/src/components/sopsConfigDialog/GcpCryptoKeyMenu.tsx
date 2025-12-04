import { Avatar, ListItemButton, ListSubheader, Menu } from '@mui/material';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import { GcpCryptoKeyMenuItem } from './GcpCryptoKeyMenuItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { VpnKey } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, MouseEvent } from 'react';
import { Box } from '@backstage/ui';
import styles from './SopsConfigDialog.module.css';

interface GcpCryptoKeyMenuProps {
  chosenGcpCryptoKey: GcpCryptoKeyObject;
  onChange: (gcpCryptoKey: GcpCryptoKeyObject) => void;
  gcpCryptoKeys: GcpCryptoKeyObject[];
}

export function GcpCryptoKeyMenu({
  chosenGcpCryptoKey,
  onChange,
  gcpCryptoKeys,
}: GcpCryptoKeyMenuProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClickMenuItem(gcpCryptoKey: GcpCryptoKeyObject) {
    onChange(gcpCryptoKey);
    setAnchorEl(null);
  }

  const gcpCryptoKeysGroupedByAccess = gcpCryptoKeys.reduce<
    Record<string, GcpCryptoKeyObject[]>
  >((acc, gcpCryptoKey) => {
    const key = (gcpCryptoKey.hasEncryptDecryptAccess ?? false).toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(gcpCryptoKey);
    return acc;
  }, {});

  return (
    <Box className={styles.GcpCryptoKeyMenuContainer}>
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
              <Avatar
                sx={{
                  backgroundColor:
                    chosenGcpCryptoKey.projectId !== ''
                      ? 'primary.main'
                      : 'default',
                  color:
                    chosenGcpCryptoKey.projectId !== '' ? 'white' : 'inherit',
                }}
              >
                <VpnKey />
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={chosenGcpCryptoKey.keyName}
              secondary={<>Project ID: {chosenGcpCryptoKey.projectId}</>}
            />
            <ExpandMoreIcon sx={{ marginLeft: 'auto' }} />
            {!chosenGcpCryptoKey.hasEncryptDecryptAccess && (
              <>
                <WarningAmberIcon sx={{ color: 'red' }} />
                {t('dictionary.noAccess')}
              </>
            )}
          </>
        )}
      </ListItemButton>
      <Menu
        disablePortal
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
          <li key={`access-group-${hasAccess}`}>
            <ul style={{ paddingLeft: 0, marginLeft: 0 }}>
              <ListSubheader>
                {hasAccess === 'true'
                  ? t('sopsConfigDialog.gcpKeyHaveAccess')
                  : t('sopsConfigDialog.gcpKeyDoNotHaveAccess')}
              </ListSubheader>
              {gcpCryptoKeysGroupedByAccess[hasAccess].map(gcpCryptoKey => (
                <GcpCryptoKeyMenuItem
                  key={`${gcpCryptoKey.projectId}-${gcpCryptoKey.keyRing}-${gcpCryptoKey.keyName}`}
                  value={JSON.stringify(gcpCryptoKey)}
                  gcpCryptoKey={gcpCryptoKey}
                  handleClick={handleClickMenuItem}
                  hasAccess={hasAccess === 'true'}
                  isSelected={
                    gcpCryptoKey.projectId === chosenGcpCryptoKey.projectId &&
                    gcpCryptoKey.keyRing === chosenGcpCryptoKey.keyRing &&
                    gcpCryptoKey.keyName === chosenGcpCryptoKey.keyName
                  }
                />
              ))}
            </ul>
          </li>
        ))}
      </Menu>
    </Box>
  );
}
