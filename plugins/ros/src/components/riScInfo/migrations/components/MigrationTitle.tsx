import { ChangeSetTitle } from '../../changeset/components/ChangeSetTitle.tsx';
import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@mui/material/Link';
import { HelpIcon } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../../utils/translations.ts';
import { useMigrationStyles } from './migrationStyles.ts';

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
  const styles = useMigrationStyles();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <div className={styles.migrationTitle}>
      <ChangeSetTitle
        text={t('migrationDialog.migrationTitle', { to: to, from: from })}
      />
      <div className={styles.migrationChangelog}>
        <Tooltip title={migrationExplanation}>
          <Link target="_blank" href={changelogUrl} color="inherit">
            {t('migrationDialog.schemaChangelog')}
            <IconButton color="inherit" size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}
