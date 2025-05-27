import { ChangeSetTitle } from './ChangeSetTitle.tsx';
import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@mui/material/Link';
import { HelpIcon } from '@backstage/core-components';
import { useChangeSetStyles } from './changeSetStyles.ts';

interface MigrationTitleProps {
  from: string;
  to: string;
  migrationExplanation: string;
  changelogUrl: string;
}

export function MigrationTitle({
  from,
  to,
  migrationExplanation,
  changelogUrl,
}: MigrationTitleProps) {
  const { migrationTitle, migrationChangelog } = useChangeSetStyles();
  return (
    <div className={migrationTitle}>
      <ChangeSetTitle text={`Migration from ${from} to ${to}`} />
      <div className={migrationChangelog}>
        <Tooltip title={migrationExplanation}>
          <Link target="_blank" href={changelogUrl} color="inherit">
            Schema changelog
            <IconButton color="inherit" size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}
