import { ChangeSetTitle } from './ChangeSetTitle.tsx';
import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@mui/material/Link';
import { HelpIcon } from '@backstage/core-components';

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
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: '4px',
      }}
    >
      <ChangeSetTitle text={`Migration from ${from} to ${to}`} />
      <div style={{ color: '#156630', fontWeight: '700' }}>
        <Tooltip title={migrationExplanation}>
          <Link
            target="_blank"
            href={changelogUrl}
            color="inherit"
          >
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
