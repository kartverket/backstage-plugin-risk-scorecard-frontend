import MenuItem from '@mui/material/MenuItem';
import { VpnKey } from '@mui/icons-material';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';

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
  return (
    <MenuItem
      value={value}
      onClick={() => handleClick(JSON.parse(value) as GcpCryptoKeyObject)}
      disabled={!hasAccess}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            backgroundColor: isSelected ? 'primary.main' : 'default',
            color: isSelected ? 'white' : 'inherit',
          }}
        >
          <VpnKey />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={gcpCryptoKey.keyName}
        secondary={<>Project ID: {gcpCryptoKey.projectId}</>}
      />
    </MenuItem>
  );
}
