import MenuItem from '@mui/material/MenuItem';

import { VpnKey } from '@mui/icons-material';
import { GcpCryptoKeyObject } from '../../utils/DTOs';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Tooltip } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';

interface GcpCryptoKeyMenuItemProps {
  value: string;
  gcpCryptoKey: GcpCryptoKeyObject;
  handleClick: (gcpCryptoKey: GcpCryptoKeyObject) => void;
  hasAccess: boolean;
}

export function GcpCryptoKeyMenuItem({
  value,
  gcpCryptoKey,
  handleClick,
  hasAccess,
}: GcpCryptoKeyMenuItemProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Tooltip
      title={t('sopsConfigDialog.gcpKeyDoNotHaveAccessDescription')}
      disableHoverListener={hasAccess}
    >
      <MenuItem
        value={value}
        onClick={() => handleClick(JSON.parse(value) as GcpCryptoKeyObject)}
        disabled={!hasAccess}
      >
        <ListItemAvatar>
          <Avatar>
            <VpnKey />
          </Avatar>
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
    </Tooltip>
  );
}
