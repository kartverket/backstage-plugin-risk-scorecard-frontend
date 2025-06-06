import { makeStyles, Theme } from '@material-ui/core';
import { fontWeightBold, interactiveColor } from '../../changeset/components/changeSetStyles';

export const useMigrationStyles = makeStyles((theme: Theme) => ({
  // MigrationTitle
  migrationTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '4px',
  },
  migrationChangelog: {
    color: interactiveColor(theme),
    fontWeight: fontWeightBold,
  },
}));
