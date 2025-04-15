import MenuItem from '@mui/material/MenuItem';
import { VpnKey, Check } from '@mui/icons-material';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface GcpCryptoKeyMenuItemProps {
  value: string;
  gcpCryptoKey: GcpCryptoKeyObject;
  handleClick: (gcpCryptoKey: GcpCryptoKeyObject) => void;
  hasAccess: boolean;
  isSelected: boolean;
}

export function GcpCryptoKeyMenuItem({
  value,
  gcpCryptoKey,
  handleClick,
  hasAccess,
  isSelected,
}: GcpCryptoKeyMenuItemProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <MenuItem
      value={value}
      onClick={() => handleClick(JSON.parse(value) as GcpCryptoKeyObject)}
      disabled={!hasAccess}
      sx={{
        backgroundColor: isSelected ? 'green.100' : 'inherit',
        '&:hover': {
          backgroundColor: isSelected ? 'green.200' : 'grey.100',
        },
      }}
    >
      <ListItemAvatar>
        <Avatar>{isSelected ? <Check /> : <VpnKey />} </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={gcpCryptoKey.keyName}
        secondary={
          <>
            Project ID: {gcpCryptoKey.projectId}
            <br />
            Key ring: {gcpCryptoKey.keyRing}
          </>
        }
      />
    </MenuItem>
  );
}
