import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Settings from '@material-ui/icons/Settings';

interface SopsConfigButtonProps {
  handleClick: () => void;
  disable: boolean;
  pullRequestCount: number;
  hasOpenedOnce: boolean;
}

export function SopsConfigButton({
  handleClick,
  disable,
  pullRequestCount,
  hasOpenedOnce,
}: SopsConfigButtonProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Badge
      color="error"
      badgeContent={pullRequestCount}
      invisible={hasOpenedOnce}
    >
      <Button
        disabled={disable}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
        onClick={handleClick}
      >
        <Settings />
        {`${t('sopsConfigDialog.title')}`}
      </Button>
    </Badge>
  );
}
